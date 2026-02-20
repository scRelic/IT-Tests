export default defineEventHandler(async (event) => {
    try {
        const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };

        if (!session || !session.user) {
            return { hasActiveSession: false, testId: null };
        }

        const userId = session.user.id;

        const activeSession = await db.query(
            'SELECT id, test_id FROM test_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
            [userId]
        );

        if (activeSession.rows.length > 0) {
            const testId = activeSession.rows[0].test_id;
            return {
                hasActiveSession: true,
                testId: testId,
                sessionId: activeSession.rows[0].id,
            };
        }

        return { hasActiveSession: false, testId: null };
    } catch (error) {
        console.error('Error checking active test session:', error);
        return { hasActiveSession: false, testId: null };
    }
});
