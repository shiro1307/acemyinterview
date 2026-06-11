"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavLinksProps {
    isAuthenticated: boolean;
    userEmail?: string | null;
}

export default function NavLinks({ isAuthenticated, userEmail }: NavLinksProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [menuOpen]);

    const isActive = (href: string) => {
        if (href === "/history") {
            return pathname === href || pathname.startsWith("/session/");
        }
        return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    };

    const linkClass = (href: string) =>
        `navbar-link ${isActive(href) ? "navbar-link-active" : ""}`.trim();

    return (
        <>
            <button
                type="button"
                className="navbar-toggle"
                aria-expanded={menuOpen}
                aria-controls="navbar-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
            >
                <span className="navbar-toggle-bar" />
                <span className="navbar-toggle-bar" />
                <span className="navbar-toggle-bar" />
            </button>

            <div id="navbar-menu" className={`navbar-menu ${menuOpen ? "navbar-menu-open" : ""}`}>
                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard" className={linkClass("/dashboard")}>
                                Dashboard
                            </Link>
                            <Link href="/interview" className={linkClass("/interview")}>
                                Interview
                            </Link>
                            <Link href="/history" className={linkClass("/history")}>
                                History
                            </Link>
                        </>
                    ) : (
                        <Link href="/" className={linkClass("/")}>
                            Home
                        </Link>
                    )}
                </div>
                <div className="navbar-auth">
                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">{userEmail}</span>
                            <Link href="/logout" className="navbar-link">
                                Logout
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={linkClass("/login")}>
                                Login
                            </Link>
                            <Link href="/signup" className="navbar-link navbar-link-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
