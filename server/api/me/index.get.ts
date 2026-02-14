import db from '../../utils/db'

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

    const [user, countUserTests] = await Promise.all([
      db.query('SELECT id, name, email, birth_date, created_at, level, exp, last_visit_date, avatar_url, current_streak, role FROM users WHERE id = $1', [userId]),
      db.query('SELECT COUNT(*) FROM test_results WHERE user_id = $1', [userId]),
    ]);

    const row = user.rows[0];
    if (!row) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      });
    }

    const birthDate = formatDate(row.birth_date);
    const lastVisitDate = formatDate(row.last_visit_date);
    const created_at = formatDate(row.created_at);

    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();

    if (lastVisitDate !== todayStr) {
      const prevStreak = Number(row.current_streak ?? 0);
      const newStreak = lastVisitDate === yesterdayStr ? prevStreak + 1 : 1;

      await db.query('UPDATE users SET last_visit_date = $1, current_streak = $2 WHERE id = $3', [todayStr, newStreak, userId]);

      row.current_streak = newStreak;
      row.last_visit_date = todayStr;
    }


    return {
      ...row,
      birth_date: birthDate,
      last_visit_date: row.last_visit_date ?? lastVisitDate,
      created_at: created_at,
      count_completed_tests: Number(countUserTests.rows[0].count),
    };
  }
  catch (error: any) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error("Error fetching user:", error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user ' + (error?.message || ''),
    })
  }

})

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};



const getTodayStr = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
