import SessionListItem from "../components/SessionListItem";
import { sessions } from "../data/sessions";

export default function HistoryPage() {

    return (
        <>
            Interview history placeholder
            <br />

            <ol>
                {
                    sessions.map((session) => (
                        <SessionListItem key={session.id} id={Number(session.id)} role={session.role} />
                    ))
                }
            </ol>
        </>
    );
}
