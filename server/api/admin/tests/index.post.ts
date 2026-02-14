import db from "../../../utils/db";

type OptionInput = {
    id?: number;
    answer_id?: number;
    text: string;
};

type QuestionInput = {
    id?: number;
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

    if (!Array.isArray(questions) || questions.length === 0) {
        throw createError({ statusCode: 400, message: "At least one question is required" });
    }

    for (const q of questions) {
        if (!q || typeof q !== "object") {
            throw createError({ statusCode: 400, message: "Invalid questions" });
        }

        if (!isNonEmptyString(q.question_text)) {
            throw createError({ statusCode: 400, message: "Question text is required" });
        }

        if (!Array.isArray(q.answers) || q.answers.length < 2) {
            throw createError({ statusCode: 400, message: "Each question must have at least two answers" });
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

        if (q.correct_answer_id === null) {
            throw createError({ statusCode: 400, message: "Each question must have a correct answer" });
        }

        if (!Number.isInteger(q.correct_answer_id) || q.correct_answer_id <= 0) {
            throw createError({ statusCode: 400, message: "Invalid correct_answer_id" });
        }

        const allowed = new Set(
            q.answers
                .map((a) => asPositiveIntOrNull((a as any).answer_id) ?? asPositiveIntOrNull((a as any).id))
                .filter((v): v is number => v !== null),
        );
        if (!allowed.has(q.correct_answer_id)) {
            throw createError({ statusCode: 400, message: "correct_answer_id must match one of answers.answer_id" });
        }
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const createdTest = await client.query(
            `INSERT INTO tests (title, description, category_id)
       VALUES ($1, $2, $3)
       RETURNING id;`,
            [title.trim(), description, categoryId],
        );

        if (createdTest.rowCount === 0) {
            throw createError({ statusCode: 500, message: "Failed to create test" });
        }

        const testId = Number(createdTest.rows[0].id);

        for (const q of questions) {
            const normalizedAnswers = q.answers.map((a, idx) => {
                const normalizedAnswerId =
                    asPositiveIntOrNull((a as any).answer_id) ?? asPositiveIntOrNull((a as any).id) ?? idx + 1;
                return {
                    answer_id: normalizedAnswerId,
                    text: String((a as any).text ?? "").trim(),
                };
            });

            await client.query(
                `INSERT INTO questions (test_id, question_text, answers, correct_answer_id)
         VALUES ($1, $2, $3::jsonb, $4);`,
                [testId, q.question_text.trim(), JSON.stringify(normalizedAnswers), q.correct_answer_id],
            );
        }

        await client.query("COMMIT");

        return { message: "Test created successfully", id: testId };
    } catch (err: any) {
        await client.query("ROLLBACK");

        if (err && typeof err === "object" && "statusCode" in err) {
            throw err;
        }

        console.error("Error creating test:", err);
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    } finally {
        client.release();
    }
});
