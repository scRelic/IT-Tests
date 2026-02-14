import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { title, description, technologies } = body;

    const id = Number(getRouterParam(event, "id"));

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid category id" });
    }

    const result = await db.query(
      `UPDATE categories 
       SET title = $1, 
           description = $2, 
           technologies = $3::text[] 
       WHERE id = $4 
       RETURNING id;`,
      [title, description || '', technologies ?? [], id]
    );

    if (result.rowCount === 0) {
      throw createError({ statusCode: 404, message: "Category not found" });
    }

    return {
      message: "Category updated successfully",
      category: result.rows[0],
    };

  } catch (err: any) {
    if (err.statusCode) throw err;

    console.error("Error updating category:", err);
    throw createError({ statusCode: 500, message: "Internal Server Error" });
  }
});