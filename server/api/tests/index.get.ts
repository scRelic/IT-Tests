import db from '../../utils/db';
import { getQuery } from 'h3';

type SortType = 'new' | 'old' | 'most' | 'fewest' | 'random';

export default defineEventHandler(async (event) => {
  try {
    const { category, sort, limit, page } = getQuery(event);

    const values: Array<string | number> = [];
    const where: string[] = [];

    const pageSize = Math.min(100, Math.max(1, Number(limit) || 12));
    const currentPage = Math.max(1, Number(page) || 1);
    const offset = (currentPage - 1) * pageSize;

    const limitClause = `LIMIT $${values.push(pageSize)}`;
    const offsetClause = `OFFSET $${values.push(offset)}`;

    if (category && category !== 'All') {
      values.push(String(category));
      where.push(`c.title = $${values.length}`);
    }

    const orderClause = getSortClause(sort as SortType);

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
      SELECT 
        t.*, 
        c.title AS category, 
        COUNT(q.id) AS questions_count,
        COUNT(*) OVER() AS total_tests
      FROM tests t
      LEFT JOIN questions q ON t.id = q.test_id
      LEFT JOIN categories c ON t.category_id = c.id
      ${whereClause}
      GROUP BY t.id, c.title
      ${orderClause}
      ${limitClause}
      ${offsetClause};
    `;

    const result = await db.query(query, values);

    const total = result.rows[0]?.total_tests
      ? Number(result.rows[0].total_tests)
      : 0;

    const tests = result.rows.map(({ total_tests, ...row }) => row);

    return { tests, total };
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch tests',
    });
  }
});

const getSortClause = (sort: SortType = 'new') => {
  const sortMap: Record<SortType, string> = {
    new: 'ORDER BY t.created_at DESC',
    old: 'ORDER BY t.created_at ASC',
    most: 'ORDER BY questions_count DESC',
    fewest: 'ORDER BY questions_count ASC',
    random: 'ORDER BY RANDOM()',
  };

  const key = sort as SortType;
  return sortMap[key] || sortMap.new;
};
