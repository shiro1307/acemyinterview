import RoleSelector from "../components/RoleSelector";
import { sessions } from "../data/sessions";

export default function InterviewPage() {
    const roles = sessions.map((session) => ({
        id: session.id,
        name: session.role,
    }));

    return (
        <>
            Interview, choose roles and stuff
            <div>
                <h1>Select a Role</h1>
                <RoleSelector roles={roles} />
            </div>
        </>
    );
}
