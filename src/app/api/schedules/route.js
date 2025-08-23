import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new driver schedule
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const userProfile = await sql`
      SELECT * FROM users WHERE auth_user_id = ${session.user.id}
    `;

    if (userProfile.length === 0) {
      return Response.json({ error: "User profile not found" }, { status: 404 });
    }

    const user = userProfile[0];
    if (user.role !== 'driver' && user.role !== 'admin') {
      return Response.json({ error: "Only drivers can create schedules" }, { status: 403 });
    }

    const body = await request.json();
    const { date, time, start_location, end_location, capacity = 4, price_per_seat } = body;

    if (!date || !time || !start_location || !end_location) {
      return Response.json({ 
        error: "Date, time, start location, and end location are required" 
      }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO driver_schedules (driver_id, date, time, start_location, end_location, capacity, price_per_seat)
      VALUES (${user.id}, ${date}, ${time}, ${start_location}, ${end_location}, ${capacity}, ${price_per_seat})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get schedules (with filtering)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driver_id');
    const date = searchParams.get('date');
    const startLocation = searchParams.get('start_location');
    const endLocation = searchParams.get('end_location');
    const available = searchParams.get('available'); // only schedules with available seats

    let query = `
      SELECT ds.*, u.name as driver_name, u.phone as driver_phone
      FROM driver_schedules ds
      JOIN users u ON ds.driver_id = u.id
      WHERE ds.status = 'active'
    `;
    const values = [];
    let paramCount = 0;

    if (driverId) {
      query += ` AND ds.driver_id = $${++paramCount}`;
      values.push(driverId);
    }

    if (date) {
      query += ` AND ds.date = $${++paramCount}`;
      values.push(date);
    }

    if (startLocation) {
      query += ` AND LOWER(ds.start_location) LIKE LOWER($${++paramCount})`;
      values.push(`%${startLocation}%`);
    }

    if (endLocation) {
      query += ` AND LOWER(ds.end_location) LIKE LOWER($${++paramCount})`;
      values.push(`%${endLocation}%`);
    }

    if (available === 'true') {
      query += ` AND ds.seats_filled < ds.capacity`;
    }

    query += ` ORDER BY ds.date, ds.time`;

    const result = await sql(query, values);
    return Response.json(result);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}