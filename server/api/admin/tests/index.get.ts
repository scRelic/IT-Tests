import { getQuery } from 'h3';
import db from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event);
    const { page, limit } = queryParams;

    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
    const currentPage = Math.max(1, Number(page) || 1);
    const offset = (currentPage - 1) * pageSize;

    const search = typeof queryParams.search === 'string' ? queryParams.search.trim() : '';
    const category = typeof queryParams.category === 'string' ? queryParams.category.trim() : '';
    const sortBy = typeof queryParams.sortBy === 'string' ? queryParams.sortBy.trim() : '';
    const sortDirRaw = typeof queryParams.sortDir === 'string' ? queryParams.sortDir.trim().toLowerCase() : '';
    const sortDir = sortDirRaw === 'asc' ? 'ASC' : 'DESC';

    const values: Array<string | number> = [];
    const where: string[] = [];

    if (search) {
      values.push(`%${search}%`);
      const p = values.length;
      where.push(`(t.title ILIKE $${p} OR COALESCE(t.description, '') ILIKE $${p})`);
    }

    if (category && category !== 'All') {
      values.push(category);
      const p = values.length;
      where.push(`c.title = $${p}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let orderClause = 'ORDER BY t.id DESC';
    if (sortBy === 'created_at') {
      orderClause = `ORDER BY t.created_at ${sortDir} NULLS LAST, t.id DESC`;
    }

    const limitClause = `LIMIT $${values.push(pageSize)}`;
    const offsetClause = `OFFSET $${values.push(offset)}`;

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

    return {
      tests,
      total,
      page: currentPage,
      limit: pageSize,
    };
  }
  catch (error) {
    console.error('Error fetching admin data:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
