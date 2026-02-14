import { getQuery } from 'h3';
import db from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const { limit } = getQuery(event);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 12));

    const query = `
      SELECT 
        t.*, 
        c.title AS category, 
        COUNT(q.id) AS questions_count
      FROM tests t
      LEFT JOIN questions q ON t.id = q.test_id
      LEFT JOIN categories c ON t.category_id = c.id
      GROUP BY t.id, c.title
      ORDER BY RANDOM()
      LIMIT $1;`;

    const tests = await db.query(query, [pageSize]);

    return tests.rows;
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch tests',
    });
  }
});
