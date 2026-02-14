import db from '../../utils/db'

type AnswerSubmission = {
  question_id: number;
  answer_id: number;
  is_correct?: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const { answers, test_id } = await readBody<{ answers: Array<AnswerSubmission>, test_id: number }>(event)
    const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };

    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    const userId = session.user.id;
    let score = 0

    const questions = await db.query(
      'SELECT * FROM questions WHERE test_id = $1',
      [test_id]
    )

    const correctAnswersMap = new Map<number, number>()

    questions.rows.forEach((q: { id: number; correct_answer_id: number }) => {
      correctAnswersMap.set(q.id, q.correct_answer_id)
    })


    answers.forEach(({ question_id, answer_id }) => {
      if (correctAnswersMap.get(question_id) === answer_id) {
        score += 1
        answers.find(a => a.question_id === question_id)!.is_correct = true
      }
      else {
        answers.find(a => a.question_id === question_id)!.is_correct = false
      }
    })

    const totalQuestions = questions.rows.length
    const percentage = (score / totalQuestions) * 100

    const res = await db.query(
      `INSERT INTO test_results (user_id, test_id, score, total_questions, finished_at, answers)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING id`,
      [userId, test_id, score, totalQuestions, JSON.stringify(answers)]
    )

    let review = answers.map(ans => {
      const question = questions.rows.find((q: { id: number }) => q.id === ans.question_id)
      return {
        question_id: ans.question_id,
        question_text: question ? question.question_text : '',
        selected_answer_id: ans.answer_id,
        is_correct: ans.is_correct,
        correct_answer_id: question ? question.correct_answer_id : null,
        answers: question ? question.answers : [],
      }
    })

    return {
      score,
      totalQuestions,
      percentage,
      review: review,
    }
  }
  catch (error) {
    console.error('Error processing test result submission:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process test result submission',
    })
  }

})
