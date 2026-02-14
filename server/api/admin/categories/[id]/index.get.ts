import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid category id" });
    }

    const result = await db.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      throw createError({ statusCode: 404, message: "Category not found" });
    }

    return {
      category: result.rows[0],
    };
  }
  catch (err: any) {
    if (err.statusCode) {
      throw err;
    }
    else {
      console.error("Error fetching category:", err);
      throw createError({ statusCode: 500, message: "Internal Server Error" });
    }

  }
});
