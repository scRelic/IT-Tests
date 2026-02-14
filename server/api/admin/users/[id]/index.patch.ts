import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const idParam = getRouterParam(event, "id");
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid user ID" });
    }

    const updates = [];
    const values = [];

    const allowedFields = ['name', 'role'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        values.push(body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      throw createError({ statusCode: 400, message: "No valid data provided for update" });
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = $${values.length}
      RETURNING id, name, email, role;
    `;

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw createError({ statusCode: 404, message: "User not found" });
    }

    return {
      message: "User updated successfully",
      user: result.rows[0]
    };

  } catch (error: any) {
    if (error.statusCode) throw error;

    console.error("Update user error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    });
  }
});