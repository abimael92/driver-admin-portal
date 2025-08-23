import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new user profile
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, role = 'customer' } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if user profile already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE auth_user_id = ${session.user.id}
    `;

    if (existingUser.length > 0) {
      return Response.json({ error: "User profile already exists" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO users (auth_user_id, name, email, phone, role)
      VALUES (${session.user.id}, ${name}, ${session.user.email}, ${phone}, ${role})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get current user profile
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM users WHERE auth_user_id = ${session.user.id}
    `;

    if (result.length === 0) {
      return Response.json({ error: "User profile not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, role } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 0;

    if (name !== undefined) {
      setClauses.push(`name = $${++paramCount}`);
      values.push(name);
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${++paramCount}`);
      values.push(phone);
    }
    if (role !== undefined) {
      setClauses.push(`role = $${++paramCount}`);
      values.push(role);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`updated_at = $${++paramCount}`);
    values.push(new Date().toISOString());

    values.push(session.user.id);
    const query = `
      UPDATE users 
      SET ${setClauses.join(', ')}
      WHERE auth_user_id = $${++paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}