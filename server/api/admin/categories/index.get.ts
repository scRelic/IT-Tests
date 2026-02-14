export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event);
    const limit = Math.min(100, Math.max(1, Number(queryParams.limit) || 10));
    const page = Math.max(1, Number(queryParams.page) || 1);
    const offset = (page - 1) * limit;
    const search = typeof queryParams.search === 'string' ? queryParams.search.trim() : '';

    const sortBy = typeof queryParams.sortBy === 'string' ? queryParams.sortBy.trim() : '';
    const sortDirRaw = typeof queryParams.sortDir === 'string' ? queryParams.sortDir.trim().toLowerCase() : '';
    const sortDir = sortDirRaw === 'asc' ? 'ASC' : 'DESC';

    let orderBySql = 'c.id DESC';
    if (sortBy === 'created_at') {
      orderBySql = `c.created_at ${sortDir} NULLS LAST, c.id DESC`;
    }
    if (sortBy === 'tests_count') {
      orderBySql = `tests_count ${sortDir}, c.id DESC`;
    }

    const whereClause = search ? "WHERE c.title ILIKE $1 OR c.description ILIKE $1" : "";
    const queryParamsList = search ? [`%${search}%`] : [];

    const pIdx = queryParamsList.length;

    const [totalResult, categoriesResult] = await Promise.all([
      db.query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM categories c ${whereClause};`,
        queryParamsList
      ),
      db.query<Category>(
        `SELECT c.*, COUNT(t.id)::int AS tests_count
         FROM categories c
         LEFT JOIN tests t ON t.category_id = c.id
         ${whereClause}
         GROUP BY c.id
         ORDER BY ${orderBySql}
         LIMIT $${pIdx + 1} OFFSET $${pIdx + 2};`,
        [...queryParamsList, limit, offset]
      ),
    ]);

    return {
      categories: categoriesResult.rows,
      total: totalResult.rows[0]?.count ?? 0,
      page,
      limit,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching admin categories:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});