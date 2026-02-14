import db from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const idParam = event.context.params?.id;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Invalid test id',
      });
    }

    const queryTest = `
      SELECT 
        t.*,
        c.title AS category
      FROM tests t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
      GROUP BY t.id, c.title;`;

    const [questions, test] = await Promise.all([
      db.query(
        'SELECT id, test_id, question_text, answers FROM questions WHERE test_id = $1',
        [id]
      ),
      db.query(queryTest, [id]),
    ]);

    if (!test.rows[0]) {
      throw createError({
        statusCode: 404,
        message: 'Test not found',
      });
    }

    return {
      test: test.rows[0],
      questions: questions.rows,
    };
  }
  catch (error) {
    console.error('Error fetching test questions:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch test questions',
    });
  }
});
