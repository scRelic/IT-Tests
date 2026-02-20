import db from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const { filter = "All time" } = getQuery(event)

    const params: unknown[] = []
    let dateCondition = ""

    if (filter === "This month") {
      dateCondition = "AND t.created_at >= DATE_TRUNC('month', NOW())"
    } else if (filter === "This week") {
      dateCondition = "AND t.created_at >= DATE_TRUNC('week', NOW())"
    }

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.avatar_url, 
        COUNT(t.id) AS tests_count
      FROM users u
      LEFT JOIN test_results t ON t.user_id = u.id ${dateCondition}
      GROUP BY u.id, u.name, u.avatar_url
      ORDER BY tests_count DESC, u.id
      LIMIT 10
    `

    const leaderboards = await db.query(query, params)
    return leaderboards.rows

  } catch (error) {
    console.error('Error fetching leaderboards:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})