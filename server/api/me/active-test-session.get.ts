import db from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };

        if (!session || !session.user) {
            return { hasActiveSession: false, testId: null };
        }

        const userId = session.user.id;

        const activeSession = await db.query(
            `SELECT ts.id, ts.test_id, t.title AS test_title
             FROM test_sessions ts
             LEFT JOIN tests t ON t.id = ts.test_id
             WHERE ts.user_id = $1
             ORDER BY ts.id DESC
             LIMIT 1`,
            [userId]
        );

        if (activeSession.rows.length > 0) {
            const testId = activeSession.rows[0].test_id;
            return {
                hasActiveSession: true,
                testId: testId,
                sessionId: activeSession.rows[0].id,
                testTitle: activeSession.rows[0].test_title ?? null,
            };
        }

        return { hasActiveSession: false, testId: null, testTitle: null };
    } catch (error) {
        console.error('Error checking active test session:', error);
        return { hasActiveSession: false, testId: null, testTitle: null };
    }
});
