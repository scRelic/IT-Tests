export default defineEventHandler(async (event) => {
    try {
        const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };
        const { testId } = getQuery(event);

        if (!session || !session.user) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized',
            });
        }

        const userId = session.user.id;
        const testIdNum = Number(testId);

        if (!Number.isFinite(testIdNum) || testIdNum <= 0) {
            throw createError({
                statusCode: 400,
                message: 'Invalid test id',
            });
        }

        const result = await db.query(
            `SELECT ts.id, ts.start_time, t.time_limit 
       FROM test_sessions ts
       JOIN tests t ON ts.test_id = t.id
       WHERE ts.user_id = $1 AND ts.test_id = $2 
       ORDER BY ts.id DESC LIMIT 1`,
            [userId, testIdNum]
        );

        if (result.rows.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Test session not found',
            });
        }

        const session_data = result.rows[0] as { id: number; start_time: string; time_limit: number | null };
        const startTime = new Date(session_data.start_time).getTime();
        const timeLimit = (session_data.time_limit || 0) * 60 * 1000;
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const remainingTime = Math.max(0, timeLimit - elapsedTime);
        const isExpired = remainingTime === 0 && timeLimit > 0;

        return {
            sessionId: session_data.id,
            startTime,
            timeLimit,
            currentTime,
            elapsedTime,
            remainingTime,
            isExpired,
        };
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        console.error('Error getting session timer:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to get session timer',
        });
    }
});
