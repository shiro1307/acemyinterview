import { getUser } from "../../lib/supabase/server";
import { createClient } from "../../lib/supabase/server";

interface SessionPageProps {
    params: Promise<{ sessionId: string }>;
}

interface SessionQuestionRow {
    id: string;
    question_id: string;
    order_index: number;
}

interface QuestionRow {
    id: string;
    text: string;
}

interface AnswerRow {
    id: string;
    question_id: string;
    text: string;
}

interface FeedbackRow {
    id: string;
    answer_id: string;
    score: number;
    strengths: string[];
    missing_points: string[];
    model_answer: string;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const user = await getUser();

    if (!user) {
        return <div>Please log in to view this session</div>;
    }

    const { sessionId } = await params;
    const supabase = await createClient();

    // Fetch session and verify ownership
    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

    if (!session || sessionError) {
        return <div>Session not found or access denied</div>;
    }

    // 1. Fetch session_questions
    const { data: sessionQuestionsData, error: sqError } = await supabase
        .from("session_questions")
        .select("id, question_id, order_index")
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

    if (sqError) {
        return <div>Error loading session questions: {sqError.message}</div>;
    }

    const sqRows = (sessionQuestionsData as SessionQuestionRow[] | null) ?? [];
    const questionIds = sqRows.map((row) => row.question_id);

    // 2. Fetch questions details
    let questionRows: QuestionRow[] = [];
    if (questionIds.length > 0) {
        const { data: qData, error: qError } = await supabase
            .from("questions")
            .select("id, text")
            .in("id", questionIds);
        if (qError) {
            return <div>Error loading questions: {qError.message}</div>;
        }
        questionRows = (qData as QuestionRow[] | null) ?? [];
    }

    const questionMap = new Map<string, string>();
    questionRows.forEach((q) => {
        questionMap.set(q.id, q.text);
    });

    // 3. Fetch answers
    const { data: answersData, error: ansError } = await supabase
        .from("answers")
        .select("id, question_id, text")
        .eq("session_id", sessionId);

    if (ansError) {
        return <div>Error loading answers: {ansError.message}</div>;
    }

    const answerRows = (answersData as AnswerRow[] | null) ?? [];
    const answerMap = new Map<string, { id: string; text: string }>();
    answerRows.forEach((a) => {
        answerMap.set(a.question_id, { id: a.id, text: a.text });
    });

    // 4. Fetch feedback
    const answerIds = answerRows.map((a) => a.id);
    let feedbackRows: FeedbackRow[] = [];
    if (answerIds.length > 0) {
        const { data: fbData, error: fbError } = await supabase
            .from("feedback")
            .select("id, answer_id, score, strengths, missing_points, model_answer")
            .in("answer_id", answerIds);
        if (fbError) {
            return <div>Error loading feedback: {fbError.message}</div>;
        }
        feedbackRows = (fbData as FeedbackRow[] | null) ?? [];
    }

    const feedbackMap = new Map<string, FeedbackRow>();
    feedbackRows.forEach((fb) => {
        feedbackMap.set(fb.answer_id, fb);
    });

    // Stitch data
    const reviewItems = sqRows.map((sq) => {
        const questionText = questionMap.get(sq.question_id) || "Question not found";
        const answer = answerMap.get(sq.question_id);
        const feedback = answer ? feedbackMap.get(answer.id) : null;

        return {
            orderIndex: sq.order_index,
            questionText,
            answerText: answer?.text || null,
            score: feedback?.score ?? null,
            strengths: feedback?.strengths ?? [],
            missingPoints: feedback?.missing_points ?? [],
            modelAnswer: feedback?.model_answer ?? null,
        };
    });

    // Calculate average score for answered questions
    const scoredItems = reviewItems.filter((item) => item.score !== null);
    const averageScore = scoredItems.length > 0
        ? scoredItems.reduce((sum, item) => sum + (item.score ?? 0), 0) / scoredItems.length
        : null;

    return (
        <div>
            <h1>{session.role} - Interview Review</h1>

            {averageScore !== null ? (
                <p><strong>Average Score:</strong> {averageScore.toFixed(1)}/10</p>
            ) : (
                <p>No score calculated (no answers submitted or evaluated yet).</p>
            )}

            <hr />

            <div>
                {reviewItems.map((item, idx) => (
                    <div key={idx}>
                        <h2>Question {item.orderIndex}: {item.questionText}</h2>
                        
                        <p><strong>Your Answer:</strong></p>
                        {item.answerText ? (
                            <blockquote>
                                {item.answerText}
                            </blockquote>
                        ) : (
                            <p>No answer submitted.</p>
                        )}

                        {item.score !== null && (
                            <div>
                                <p><strong>Score:</strong> {item.score}/10</p>
                                
                                {item.strengths.length > 0 && (
                                    <div>
                                        <p><strong>Strengths:</strong></p>
                                        <ul>
                                            {item.strengths.map((str, sIdx) => (
                                                <li key={sIdx}>{str}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {item.missingPoints.length > 0 && (
                                    <div>
                                        <p><strong>Areas to Improve:</strong></p>
                                        <ul>
                                            {item.missingPoints.map((ms, mIdx) => (
                                                <li key={mIdx}>{ms}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {item.modelAnswer && (
                                    <div>
                                        <p><strong>Model Answer Reference:</strong></p>
                                        <p>{item.modelAnswer}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}