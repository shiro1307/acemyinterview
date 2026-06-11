import { createClient } from "@/app/lib/supabase/server";
import { getJoinedRoleName } from "@/app/lib/supabase/helpers";
import { SessionFeedback } from "@/app/types";

export type SessionReviewResult =
    | { type: "not_found" }
    | { type: "answers_error"; message: string }
    | { type: "no_feedback" }
    | { type: "outdated_format" }
    | {
          type: "success";
          roleName: string;
          date: string;
          interviewDuration: string | null;
          feedback: SessionFeedback;
          answerMap: Map<string, string>;
      };

function formatInterviewDuration(answersData: { created_at: string }[]): string | null {
    if (answersData.length < 2) return null;

    const firstTimestamp = new Date(answersData[0].created_at).getTime();
    const lastTimestamp = new Date(answersData[answersData.length - 1].created_at).getTime();
    const durationMs = lastTimestamp - firstTimestamp;

    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export async function getSessionReviewData(
    sessionId: string,
    userId: string
): Promise<SessionReviewResult> {
    const supabase = await createClient();

    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*, roles(name)")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

    if (!session || sessionError) {
        return { type: "not_found" };
    }

    const { data: answersData, error: ansError } = await supabase
        .from("answers")
        .select("id, question_id, text, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

    if (ansError) {
        return { type: "answers_error", message: ansError.message };
    }

    const answerMap = new Map<string, string>();
    (answersData ?? []).forEach((a) => {
        answerMap.set(a.question_id, a.text);
    });

    const interviewDuration = formatInterviewDuration(answersData ?? []);

    const { data: feedbackData, error: fbError } = await supabase
        .from("feedback")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (fbError || !feedbackData) {
        return { type: "no_feedback" };
    }

    const feedback = feedbackData as SessionFeedback;
    const evalJson = feedback.evaluation_json;

    if (evalJson.version !== 2) {
        return { type: "outdated_format" };
    }

    const date = new Date(feedback.created_at).toLocaleDateString();
    const roleName = getJoinedRoleName(session.roles ?? null, session.role);

    return {
        type: "success",
        roleName,
        date,
        interviewDuration,
        feedback,
        answerMap,
    };
}
