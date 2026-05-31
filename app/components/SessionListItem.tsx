import Link from "next/link";

interface SessionListItemProps {
    id: number;
    role: string;
}

export default function SessionListItem({ id, role }: SessionListItemProps) {
    return (
        <li>
            {id} - {role}:
            <Link href={`/session/${id}`}> Go to session {id}?</Link>
        </li>
    );
}
