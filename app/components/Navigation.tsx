import Link from "next/link";
import { getUser } from "../lib/supabase/server";

export default async function Navigation() {
    const user = await getUser();

    return (
        <nav>
            <Link href="/">Home</Link>
            {" | "}
            <Link href="/interview">Interview</Link>
            {" | "}
            <Link href="/history">History</Link>
            {" | "}
            {user ? (
                <>
                    <span>{user.email}</span>
                    {" | "}
                    <Link href="/logout">Logout</Link>
                </>
            ) : (
                <>
                    <Link href="/login">Login</Link>
                    {" | "}
                    <Link href="/signup">Sign Up</Link>
                </>
            )}
        </nav>
    );
}
