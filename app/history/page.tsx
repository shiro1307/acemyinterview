import Link from "next/link";

export default function HistoryPage() {

    const sessions = [
        {
            id: 1,
            role: "Frontend Engineer",
        },
        {
            id: 2,
            role: "Backend Engineer",
        },
    ];

    return (
        <>
            Interview history placeholder
            <br />
            <Link href="/session/1">Go view session 1?</Link>

            <br />

            <ol>
                {
                    sessions.map((session) =>
                    (<li key={session.id}>{session.id} - {session.role} :

                        <Link href={`/session/${session.id}`}>
                            Go to session {session.role}?
                        </Link>

                    </li>)
                    )
                }
            </ol>

        </>
    );
}
