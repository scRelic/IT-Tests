import db from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };

    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    const userId = session.user.id;

    const query = `
      SELECT
        tr.id,
        tr.test_id,
        t.title,
        t.description,
        t.category_id,
        c.title AS category_title,
        tr.total_questions,
        tr.score,
        tr.finished_at
      FROM test_results tr
      JOIN tests t ON t.id = tr.test_id
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE tr.user_id = $1
      ORDER BY tr.created_at DESC
      LIMIT 10;
    `;

    const { rows } = await db.query(query, [userId]);

    return rows;
  } catch (error: any) {
    console.error('Error fetching last test results:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch last test results',
    });
  }
});
