import Link from "next/link";

export default function InterviewPage() {
    return (
        <>
            Interview, choose roles and stuff
            <div>
                <h1>Select a Role</h1>

                <Link href="/interview/1">
                    Frontend Engineer
                </Link>

                <br />

                <Link href="/interview/1">
                    Backend Engineer
                </Link>

                <br />

                <Link href="/interview/1">
                    Data Analyst
                </Link>
            </div>
        </>
    );
}
