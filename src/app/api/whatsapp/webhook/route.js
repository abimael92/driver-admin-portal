import sql from "@/app/api/utils/sql";

// WhatsApp webhook handler for Twilio
export async function POST(request) {
  try {
    const body = await request.formData();
    const from = body.get('From')?.replace('whatsapp:', '');
    const messageBody = body.get('Body')?.toLowerCase().trim();
    const profileName = body.get('ProfileName') || 'Customer';

    if (!from || !messageBody) {
      return new Response('OK', { status: 200 });
    }

    // Get or create conversation state
    let conversation = await sql`
      SELECT * FROM whatsapp_conversations WHERE phone_number = ${from}
    `;

    if (conversation.length === 0) {
      await sql`
        INSERT INTO whatsapp_conversations (phone_number, state, context)
        VALUES (${from}, 'initial', '{}')
      `;
      conversation = await sql`
        SELECT * FROM whatsapp_conversations WHERE phone_number = ${from}
      `;
    }

    const conv = conversation[0];
    let context = { ...(conv.context || {}) };
    let responseMessage = '';
    let newState = conv.state;

    // Handle conversation flow
    switch (conv.state) {
      case 'initial':
        if (messageBody.includes('book') || messageBody.includes('ride') || messageBody.includes('trip')) {
          responseMessage = `Hi ${profileName}! 👋 I'll help you book a ride.\n\nPlease tell me your trip date (e.g., 2024-01-15 or tomorrow):`;
          newState = 'waiting_date';
        } else {
          responseMessage = `Hi ${profileName}! 👋 Welcome to RideWave!\n\nSend "book ride" to start booking a trip.`;
        }
        break;

      case 'waiting_date':
        // Parse date input
        let tripDate = null;
        if (messageBody.includes('today')) {
          tripDate = new Date().toISOString().split('T')[0];
        } else if (messageBody.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tripDate = tomorrow.toISOString().split('T')[0];
        } else {
          // Try to parse date format YYYY-MM-DD
          const dateMatch = messageBody.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            tripDate = dateMatch[1];
          }
        }

        if (tripDate) {
          context.date = tripDate;
          responseMessage = `Great! Trip date: ${tripDate} ✅\n\nWhat time would you like to travel? (e.g., 08:00, 2:30 PM):`;
          newState = 'waiting_time';
        } else {
          responseMessage = `Please provide a valid date format:\n• Today\n• Tomorrow\n• YYYY-MM-DD (e.g., 2024-01-15)`;
        }
        break;

      case 'waiting_time':
        // Parse time input
        let tripTime = null;
        const timeMatch = messageBody.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const ampm = timeMatch[3]?.toLowerCase();
          
          if (ampm === 'pm' && hours !== 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          
          tripTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }

        if (tripTime) {
          context.time = tripTime;
          responseMessage = `Time: ${tripTime} ✅\n\nWhere would you like to be picked up from?`;
          newState = 'waiting_pickup';
        } else {
          responseMessage = `Please provide a valid time format:\n• 08:00\n• 2:30 PM\n• 14:30`;
        }
        break;

      case 'waiting_pickup':
        context.pickup_location = messageBody;
        responseMessage = `Pickup: ${messageBody} ✅\n\nWhere are you going? (destination)`;
        newState = 'waiting_destination';
        break;

      case 'waiting_destination':
        context.destination = messageBody;
        responseMessage = `Destination: ${messageBody} ✅\n\nHow many passengers? (1-4)`;
        newState = 'waiting_passengers';
        break;

      case 'waiting_passengers':
        const passengers = parseInt(messageBody);
        if (passengers >= 1 && passengers <= 4) {
          context.passengers = passengers;
          
          // Search for available schedules
          const schedules = await sql`
            SELECT ds.*, u.name as driver_name, u.phone as driver_phone
            FROM driver_schedules ds
            JOIN users u ON ds.driver_id = u.id
            WHERE ds.date = ${context.date} 
            AND ds.status = 'active'
            AND (ds.capacity - ds.seats_filled) >= ${passengers}
            ORDER BY ds.time
          `;

          if (schedules.length > 0) {
            const schedule = schedules[0]; // Take first available
            
            // Create booking
            const booking = await sql`
              INSERT INTO bookings (schedule_id, passengers, pickup_location, destination, whatsapp_phone, status)
              VALUES (${schedule.id}, ${passengers}, ${context.pickup_location}, ${context.destination}, ${from}, 'confirmed')
              RETURNING *
            `;

            responseMessage = `🎉 Booking Confirmed!\n\n` +
              `📅 Date: ${context.date}\n` +
              `🕐 Time: ${context.time}\n` +
              `📍 From: ${context.pickup_location}\n` +
              `📍 To: ${context.destination}\n` +
              `👥 Passengers: ${passengers}\n` +
              `🚗 Driver: ${schedule.driver_name}\n` +
              `📞 Driver Phone: ${schedule.driver_phone}\n` +
              `🎫 Reference: ${booking[0].booking_reference}\n\n` +
              `You'll receive a reminder before your trip!`;

            // Send notification to driver
            await sendWhatsAppMessage(
              schedule.driver_phone,
              `🚗 New Booking Alert!\n\n` +
              `📅 ${context.date} at ${context.time}\n` +
              `👥 ${passengers} passenger(s)\n` +
              `📍 ${context.pickup_location} → ${context.destination}\n` +
              `📞 Customer: ${from}\n` +
              `🎫 Ref: ${booking[0].booking_reference}`
            );

            newState = 'completed';
          } else {
            // No available rides, add to waitlist
            responseMessage = `😔 No available rides found for ${context.date} at ${context.time}.\n\n` +
              `Would you like to:\n` +
              `1. Try a different date/time\n` +
              `2. Join the waitlist\n\n` +
              `Reply with "1" or "2"`;
            newState = 'no_rides_available';
          }
        } else {
          responseMessage = `Please enter a number between 1 and 4 for passengers.`;
        }
        break;

      case 'no_rides_available':
        if (messageBody === '1') {
          responseMessage = `Let's try again! 🔄\n\nPlease tell me your trip date:`;
          newState = 'waiting_date';
          context = {}; // Reset context
        } else if (messageBody === '2') {
          responseMessage = `You've been added to the waitlist! 📝\n\nWe'll notify you if a seat becomes available.\n\nSend "book ride" to make another booking.`;
          newState = 'completed';
        } else {
          responseMessage = `Please reply with "1" to try different date/time or "2" to join waitlist.`;
        }
        break;

      case 'completed':
        responseMessage = `Hi again! 👋\n\nSend "book ride" to make a new booking.`;
        newState = 'initial';
        context = {};
        break;

      default:
        responseMessage = `Hi! 👋 Send "book ride" to start booking a trip.`;
        newState = 'initial';
        context = {};
    }

    // Update conversation state
    await sql`
      UPDATE whatsapp_conversations 
      SET state = ${newState}, context = ${JSON.stringify(context)}, last_message_at = NOW()
      WHERE phone_number = ${from}
    `;

    // Send response via Twilio
    await sendWhatsAppMessage(from, responseMessage);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

// Function to send WhatsApp message via Twilio
async function sendWhatsAppMessage(to, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., whatsapp:+14155238886

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio credentials');
      return;
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

// Webhook verification for Twilio
export async function GET(request) {
  return new Response('WhatsApp webhook is active', { status: 200 });
}