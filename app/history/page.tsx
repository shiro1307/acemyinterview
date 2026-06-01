import SessionListItem from "../components/SessionListItem";
import { sessions } from "../data/sessions";
import { supabase } from "../lib/supabase";

export default async function HistoryPage() {
    const res = await supabase.from("sessions").select("*");

    console.log(res);

    return (
        <pre>{JSON.stringify(res, null, 2)}</pre>
    );
}

/*
export default async function HistoryPage() {
    return (
        <>
            Interview history placeholder
            <br />

            <ol>
                {
                    sessions.map((session) => (
                        <SessionListItem key={session.id} session={session} />
                    ))
                }
            </ol>
        </>
    );
}
*/