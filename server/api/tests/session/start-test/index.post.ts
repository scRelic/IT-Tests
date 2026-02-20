import db from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };
    const body = await readBody<{ test_id?: number | string; testId?: number | string }>(event);
    const rawTestId = body?.test_id ?? body?.testId;

    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    const testId = Number(rawTestId);
    if (!Number.isFinite(testId) || testId <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Invalid test id',
      });
    }

    const userId = session.user.id;

    const foundActiveSession = await db.query(
      'SELECT id, test_id FROM test_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
      [userId]
    );

    if (foundActiveSession.rows.length > 0) {
      const activeSession = foundActiveSession.rows[0] as { id: number; test_id: number };

      if (Number(activeSession.test_id) === testId) {
        return {
          message: 'Test session already active',
          sessionId: activeSession.id,
          testId,
        };
      }

      throw createError({
        statusCode: 409,
        message: 'You already have an active test session. Finish it before starting another test.',
      });
    }

    const result = await db.query(
      'INSERT INTO test_sessions (user_id, test_id, answers) VALUES ($1, $2, $3) RETURNING id, user_id, test_id',
      [userId, testId, JSON.stringify({ answers: {}, currentQuestionIndex: 0 })]
    );

    return {
      message: 'Test session started',
      session: result.rows[0],
    };

  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Error starting test session:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to start test session',
    });
  }

})
