import Link from "next/link";
import { getUser } from "../lib/supabase/server";

export default async function Navigation() {
    const user = await getUser();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-links">
                    {user ? (
                        // Authenticated user navigation
                        <>
                            <Link href="/dashboard" className="navbar-link">Dashboard</Link>
                            <Link href="/interview" className="navbar-link">Interview</Link>
                            <Link href="/history" className="navbar-link">History</Link>
                        </>
                    ) : (
                        // Unauthenticated user navigation
                        <Link href="/" className="navbar-link">Home</Link>
                    )}
                </div>
                <div className="navbar-auth">
                    {user ? (
                        <>
                            <span className="navbar-user">{user.email}</span>
                            <Link href="/logout" className="navbar-link">Logout</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="navbar-link">Login</Link>
                            <Link href="/signup" className="navbar-link navbar-link-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
