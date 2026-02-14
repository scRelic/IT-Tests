import db from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const totalTests = (await db.query('SELECT COUNT(*) AS count FROM tests')).rows[0].count;
    const totalUsers = (await db.query('SELECT COUNT(*) AS count FROM users')).rows[0].count;
    const totalQuestions = (await db.query('SELECT COUNT(*) AS count FROM questions')).rows[0].count;
    const totalCategories = (await db.query('SELECT COUNT(*) AS count FROM categories')).rows[0].count;

    return {
      totalTests,
      totalUsers,
      totalQuestions,
      totalCategories,
    };
  }
  catch (error) {
    console.error('Error fetching admin data:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
})
