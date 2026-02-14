export type Test = {
    id: number;
    title: string;
    description: string;
    category: string;
    questions: Question[];
    questions_count: number;
}

export type Question = {
    id: number;
    test_id: number;
    question_text: string;
    answers: Option[];
    correct_answer_id?: number;
}

export type Option = {
    id: number;
    answer_id: number;
    text: string;
}

export type LastTests = {
    id: number;
    test_id: number;
    title: string;
    description: string;
    category_id: number;
    category_title: string;
    total_questions: number;
    score: number;
    finished_at: string;
};
