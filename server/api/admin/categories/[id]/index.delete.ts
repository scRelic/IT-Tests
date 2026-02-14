import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, "id");
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid category id" });
    }

    const deleted = await db.query("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);

    if (deleted.rowCount === 0) {
      throw createError({ statusCode: 404, message: "Category not found" });
    }

    return { message: "Category deleted successfully" };
  } catch (error: any) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    if (error?.code === "23503") {
      throw createError({
        statusCode: 409,
        message: "Cannot delete category: it has related records",
      });
    }

    console.error("Error deleting category:", error);
    throw createError({ statusCode: 500, message: "Internal Server Error" });
  }
});
