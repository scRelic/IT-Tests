import db from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, "id");
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw createError({ statusCode: 400, message: "Invalid test id" });
    }

    const queryTestWithCategory = `
      SELECT
        t.*,
        c.title AS category
      FROM tests t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.id = $1
      LIMIT 1;
    `;

    const [testRes, questionsRes] = await Promise.all([
      db.query(queryTestWithCategory, [id]),
      db.query(
        "SELECT id, test_id, question_text, answers, correct_answer_id FROM questions WHERE test_id = $1 ORDER BY id ASC",
        [id],
      ),
    ]);

    if (testRes.rowCount === 0) {
      throw createError({ statusCode: 404, message: "Test not found" });
    }

    return {
      test: testRes.rows[0],
      questions: questionsRes.rows,
    };
  } catch (err: any) {
    if (err && typeof err === "object" && "statusCode" in err) {
      throw err;
    }

    console.error("Error fetching admin test details:", err);
    throw createError({ statusCode: 500, message: "Internal Server Error" });
  }
});
