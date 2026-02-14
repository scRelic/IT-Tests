import db from "../../../../utils/db";

type OptionInput = {
    id?: number;
    answer_id?: number;
    text: string;
};

type QuestionInput = {
    id: number;
    question_text: string;
    answers: OptionInput[];
    correct_answer_id: number | null;
};

type BodyInput = {
    title: string;
    description?: string;
    category_id: number | null;
    questions: QuestionInput[];
};

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const asPositiveIntOrNull = (value: unknown): number | null => {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
};

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, "id");
    const testId = Number(idParam);

    if (!Number.isInteger(testId) || testId <= 0) {
        throw createError({ statusCode: 400, message: "Invalid test id" });
    }

    const body = await readBody<BodyInput>(event);

    if (!body || typeof body !== "object") {
        throw createError({ statusCode: 400, message: "Invalid body" });
    }

    const title = body.title;
    const description = typeof body.description === "string" ? body.description : "";
    const categoryId = body.category_id;
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (!isNonEmptyString(title)) {
        throw createError({ statusCode: 400, message: "Title is required" });
    }

    if (!(categoryId === null || (Number.isInteger(categoryId) && categoryId > 0))) {
        throw createError({ statusCode: 400, message: "Invalid category_id" });
    }

    for (const q of questions) {
        if (!q || typeof q !== "object") {
            throw createError({ statusCode: 400, message: "Invalid questions" });
        }

        if (!Number.isInteger(q.id) || q.id <= 0) {
            throw createError({ statusCode: 400, message: "Invalid question id" });
        }

        if (!isNonEmptyString(q.question_text)) {
            throw createError({ statusCode: 400, message: "Question text is required" });
        }

        if (!Array.isArray(q.answers) || q.answers.length === 0) {
            throw createError({ statusCode: 400, message: "Each question must have answers" });
        }

        for (const a of q.answers) {
            if (!a || typeof a !== "object") {
                throw createError({ statusCode: 400, message: "Invalid answers" });
            }

            const normalizedAnswerId = asPositiveIntOrNull((a as any).answer_id) ?? asPositiveIntOrNull((a as any).id);
            if (normalizedAnswerId === null) {
                throw createError({ statusCode: 400, message: "Invalid answer_id" });
            }

            if (!isNonEmptyString(a.text)) {
                throw createError({ statusCode: 400, message: "Answer text is required" });
            }
        }

        if (q.correct_answer_id !== null) {
            if (!Number.isInteger(q.correct_answer_id) || q.correct_answer_id <= 0) {
                throw createError({ statusCode: 400, message: "Invalid correct_answer_id" });
            }

            const allowed = new Set(
                q.answers
                    .map((a) => asPositiveIntOrNull((a as any).answer_id) ?? asPositiveIntOrNull((a as any).id))
                    .filter((v): v is number => v !== null)
            );
            if (!allowed.has(q.correct_answer_id)) {
                throw createError({ statusCode: 400, message: "correct_answer_id must match one of answers.answer_id" });
            }
        }
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const updatedTest = await client.query(
            `UPDATE tests
       SET title = $1,
           description = $2,
           category_id = $3
       WHERE id = $4
       RETURNING id;`,
            [title.trim(), description, categoryId, testId]
        );

        if (updatedTest.rowCount === 0) {
            throw createError({ statusCode: 404, message: "Test not found" });
        }

        for (const q of questions) {
            const normalizedAnswers = q.answers.map((a, idx) => {
                const normalizedAnswerId = asPositiveIntOrNull((a as any).answer_id) ?? asPositiveIntOrNull((a as any).id) ?? (idx + 1);
                return {
                    answer_id: normalizedAnswerId,
                    text: String((a as any).text ?? "").trim(),
                };
            });

            const updatedQuestion = await client.query(
                `UPDATE questions
         SET question_text = $1,
             answers = $2::jsonb,
             correct_answer_id = $3
         WHERE id = $4 AND test_id = $5
         RETURNING id;`,
                [q.question_text.trim(), JSON.stringify(normalizedAnswers), q.correct_answer_id, q.id, testId]
            );

            if (updatedQuestion.rowCount === 0) {
                throw createError({ statusCode: 400, message: `Question ${q.id} not found for this test` });
            }
        }

        await client.query("COMMIT");

        return { message: "Test updated successfully" };
    } catch (err: any) {
        await client.query("ROLLBACK");

        if (err && typeof err === "object" && "statusCode" in err) {
            throw err;
        }

        console.error("Error updating test:", err);
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    } finally {
        client.release();
    }
});
