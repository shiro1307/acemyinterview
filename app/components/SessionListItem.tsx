import Link from "next/link";
import { Session } from "@/app/types";

export default function SessionListItem({ session }: { session: Session }) {
    return (
        <li>
            {session.role} ({session.status}):
            <Link href={`/session/${session.id}`}>Go to session {session.id}?</Link>
        </li>
    );
}
