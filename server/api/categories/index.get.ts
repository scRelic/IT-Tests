import { getQuery } from 'h3'
import db from '../../utils/db'
import type { Category } from '../../../shared/types/category'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = Math.max(1, Number(query.limit) || 6)
    const offset = Math.max(0, Number(query.offset) || 0)
    const search = String(query.search || '').trim()
    const searchLike = `%${search}%`

    const categories = await db.query<Category[]>(
      `
      SELECT c.*, COUNT(t.id) AS tests_count
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id
      WHERE (
        $3::text = ''
        OR c.title ILIKE $4
        OR c.description ILIKE $4
        OR COALESCE(array_to_string(c.technologies, ' '), '') ILIKE $4
      )
      GROUP BY c.id
      ORDER BY c.id
      LIMIT $1 OFFSET $2
      `,
      [limit, offset, search, searchLike]
    )

    return categories.rows
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch categories',
    })
  }
})
