import db from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {

    const countTests = db.query("SELECT COUNT(*) AS count FROM tests;");
    const countCategories = db.query("SELECT COUNT(*) AS count FROM categories;");
    const countUsers = db.query("SELECT COUNT(*) AS count FROM users;");

    const [testsRes, categoriesRes, usersRes] = await Promise.all([
      countTests,
      countCategories,
      countUsers,
    ]);

    return {
      testsCount: Number(testsRes.rows[0].count),
      categoriesCount: Number(categoriesRes.rows[0].count),
      usersCount: Number(usersRes.rows[0].count),
    };

  }
  catch (err: any) {
    if (err && typeof err === "object" && "statusCode" in err) {
      throw err;
    }

    console.error("Error fetching admin overview:", err);
    throw createError({ statusCode: 500, message: "Internal Server Error" });
  }
})
