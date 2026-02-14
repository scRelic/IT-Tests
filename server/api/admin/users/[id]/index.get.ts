import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid user id" });
    }

    const [userResult, countResult] = await Promise.all([
      db.query(
        `SELECT id, name, email, birth_date, created_at, level, exp, 
                last_visit_date, avatar_url, current_streak, role 
         FROM users WHERE id = $1`,
        [id]
      ),
      db.query('SELECT COUNT(*)::int AS count FROM test_results WHERE user_id = $1', [id]),
    ]);

    if (userResult.rowCount === 0) {
      throw createError({ statusCode: 404, message: "User not found" });
    }

    return {
      user: userResult.rows[0],
      testCount: countResult.rows[0]?.count ?? 0,
    };
  } catch (err: any) {
    if (err.statusCode) throw err;

    console.error("Error fetching user details:", err);
    throw createError({
      statusCode: 500,
      message: "An error occurred while fetching user details"
    });
  }
});