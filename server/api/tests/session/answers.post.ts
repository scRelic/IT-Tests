import db from '../../../utils/db';

type Answer = Record<number, number | null>;
type SessionData = {
    answers: Answer;
    currentQuestionIndex?: number;
};

export default defineEventHandler(async (event) => {
    try {
        const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };
        const { testId, answers, currentQuestionIndex } = await readBody<{ testId: number; answers: Answer; currentQuestionIndex?: number }>(event);

        if (!session || !session.user) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized',
            });
        }

        if (!Number.isFinite(testId) || testId <= 0) {
            throw createError({
                statusCode: 400,
                message: 'Invalid test id',
            });
        }

        const userId = session.user.id;

        const sessionData: SessionData = {
            answers,
            currentQuestionIndex: currentQuestionIndex ?? 0,
        };

        const result = await db.query(
            `UPDATE test_sessions 
       SET answers = $1 
       WHERE user_id = $2 AND test_id = $3 
       RETURNING id, answers`,
            [JSON.stringify(sessionData), userId, testId]
        );

        if (result.rows.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Test session not found',
            });
        }

        return {
            message: 'Answers saved',
            answers: result.rows[0].answers,
        };
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        console.error('Error saving answers:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to save answers',
        });
    }
});
