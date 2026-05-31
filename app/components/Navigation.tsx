import Link from "next/link";

export default function Navigation() {
    return (
        <nav style={{ borderBottom: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
            <Link href="/">Home</Link>
            {" | "}
            <Link href="/interview">Interview</Link>
            {" | "}
            <Link href="/history">History</Link>
        </nav>
    );
}
