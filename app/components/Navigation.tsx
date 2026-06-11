import Link from "next/link";
import { getUser } from "../lib/supabase/server";
import NavLinks from "./NavLinks";

export default async function Navigation() {
    const user = await getUser();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href={user ? "/dashboard" : "/"} className="navbar-brand">
                    AceMyInterview
                </Link>
                <NavLinks isAuthenticated={!!user} userEmail={user?.email} />
            </div>
        </nav>
    );
}
