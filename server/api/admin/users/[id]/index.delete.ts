import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, "id");
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid user id" });
    }

    const deleted = await db.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

    if (deleted.rowCount === 0) {
      throw createError({ statusCode: 404, message: "User not found" });
    }

    return { message: "User deleted successfully" };
  } catch (error: any) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    if (error?.code === "23503") {
      throw createError({
        statusCode: 409,
        message: "Cannot delete user: it has related records",
      });
    }

    console.error("Error deleting user:", error);
    throw createError({ statusCode: 500, message: "Internal Server Error" });
  }
});
