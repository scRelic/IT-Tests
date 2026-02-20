import db from '../../../utils/db';
import { getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };
        const testId = getQuery(event).testId;

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
            'SELECT answers FROM test_sessions WHERE user_id = $1 AND test_id = $2 ORDER BY id DESC LIMIT 1',
            [userId, testIdNum]
        );

        if (result.rows.length === 0) {
            return { answers: {}, currentQuestionIndex: 0 };
        }

        const raw = result.rows[0].answers;
        let sessionData: any = {};

        if (raw) {
            if (typeof raw === 'string') {
                try {
                    sessionData = JSON.parse(raw);
                } catch {
                    sessionData = {};
                }
            } else if (typeof raw === 'object') {
                sessionData = raw;
            }
        }

        const answers = (sessionData.answers as Record<number, number | null>) || {};
        const currentQuestionIndex = (sessionData.currentQuestionIndex as number) || 0;

        return { answers, currentQuestionIndex };
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        console.error('Error fetching saved answers:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch saved answers',
        });
    }
});
