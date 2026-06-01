import Link from "next/link";
import { Session, Question } from "@/app/types";

export default function SessionListItem({ session }: { session: Session }) {

    const averageScore =
        session.questions.reduce(
            (sum: number, q: Question) => sum + q.feedback.score,
            0
        ) / session.questions.length;

    return (
        <li>
            {session.role} (Avg. score - {averageScore}):
            <Link href={`/session/${session.id}`}>Go to session {session.id}?</Link>
        </li>
    );
}
