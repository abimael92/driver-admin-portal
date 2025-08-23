import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new booking
export async function POST(request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { schedule_id, passengers = 1, pickup_location, destination, whatsapp_phone } = body;

    if (!schedule_id) {
      return Response.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    let customer_id = null;

    // If user is authenticated, get their profile
    if (session?.user) {
      const userProfile = await sql`
        SELECT * FROM users WHERE auth_user_id = ${session.user.id}
      `;
      if (userProfile.length > 0) {
        customer_id = userProfile[0].id;
      }
    }

    // Get schedule details
    const schedule = await sql`
      SELECT * FROM driver_schedules WHERE id = ${schedule_id} AND status = 'active'
    `;

    if (schedule.length === 0) {
      return Response.json({ error: "Schedule not found or inactive" }, { status: 404 });
    }

    const scheduleData = schedule[0];
    const availableSeats = scheduleData.capacity - scheduleData.seats_filled;

    let status = 'confirmed';
    if (passengers > availableSeats) {
      if (availableSeats === 0) {
        status = 'waitlisted';
      } else {
        return Response.json({ 
          error: `Only ${availableSeats} seats available` 
        }, { status: 400 });
      }
    }

    const total_price = scheduleData.price_per_seat ? 
      scheduleData.price_per_seat * passengers : null;

    const result = await sql`
      INSERT INTO bookings (customer_id, schedule_id, passengers, pickup_location, destination, status, total_price, whatsapp_phone)
      VALUES (${customer_id}, ${schedule_id}, ${passengers}, ${pickup_location}, ${destination}, ${status}, ${total_price}, ${whatsapp_phone})
      RETURNING *
    `;

    // Get booking with schedule and driver details
    const bookingDetails = await sql`
      SELECT b.*, ds.date, ds.time, ds.start_location, ds.end_location, 
             u.name as driver_name, u.phone as driver_phone
      FROM bookings b
      JOIN driver_schedules ds ON b.schedule_id = ds.id
      JOIN users u ON ds.driver_id = u.id
      WHERE b.id = ${result[0].id}
    `;

    return Response.json(bookingDetails[0]);
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get bookings
export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const scheduleId = searchParams.get('schedule_id');
    const status = searchParams.get('status');

    let query = `
      SELECT b.*, ds.date, ds.time, ds.start_location, ds.end_location, ds.capacity, ds.seats_filled,
             u.name as driver_name, u.phone as driver_phone,
             c.name as customer_name, c.phone as customer_phone
      FROM bookings b
      JOIN driver_schedules ds ON b.schedule_id = ds.id
      JOIN users u ON ds.driver_id = u.id
      LEFT JOIN users c ON b.customer_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    // If user is authenticated, check their role
    if (session?.user) {
      const userProfile = await sql`
        SELECT * FROM users WHERE auth_user_id = ${session.user.id}
      `;
      
      if (userProfile.length > 0) {
        const user = userProfile[0];
        
        // Customers can only see their own bookings
        if (user.role === 'customer' && !customerId) {
          query += ` AND b.customer_id = $${++paramCount}`;
          values.push(user.id);
        }
        
        // Drivers can see bookings for their schedules
        if (user.role === 'driver' && !scheduleId) {
          query += ` AND ds.driver_id = $${++paramCount}`;
          values.push(user.id);
        }
      }
    }

    if (customerId) {
      query += ` AND b.customer_id = $${++paramCount}`;
      values.push(customerId);
    }

    if (scheduleId) {
      query += ` AND b.schedule_id = $${++paramCount}`;
      values.push(scheduleId);
    }

    if (status) {
      query += ` AND b.status = $${++paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY ds.date DESC, ds.time DESC`;

    const result = await sql(query, values);
    return Response.json(result);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}