import { Completeness } from "@/app/types";

export default function CompletenessBanner({ completeness }: { completeness: Completeness }) {
    if (completeness.signal === "complete") return null;

    const messages: Record<Completeness["signal"], string> = {
        partial: `${completeness.questionsAnswered}/${completeness.questionsTotal} questions answered. ${completeness.shortAnswerCount > 0 ? `${completeness.shortAnswerCount} answer(s) were very brief — ` : ""}scores may reflect incomplete responses.`,
        minimal_effort: `Only ${completeness.questionsAnswered}/${completeness.questionsTotal} questions answered with substantive content. Scores reflect limited effort.`,
        complete: "",
    };

    return <div className="banner banner-warn">{messages[completeness.signal]}</div>;
}
