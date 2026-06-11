'use client'

import Link from "next/link";

export function LandingPage() {
    return (
        <main style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--color-white)", color: "var(--color-gray-900)", overflowX: "hidden" }}>

            {/* Dot-grid background */}
            <div style={{
                pointerEvents: "none",
                position: "absolute",
                inset: 0,
                zIndex: 0,
                backgroundImage: "radial-gradient(var(--color-gray-300) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                opacity: 0.5,
            }} />

            {/* Fade the grid out at the top */}
            <div style={{
                pointerEvents: "none",
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "320px",
                zIndex: 0,
                background: "linear-gradient(to bottom, var(--color-white) 0%, transparent 100%)",
            }} />

            {/* ── Hero Section ── */}
            <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "96px 24px 72px" }}>
                <div style={{ maxWidth: "860px", margin: "0 auto" }}>

                    {/* Eyebrow badge */}
                    <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "1px solid var(--color-gray-200)",
                        borderRadius: "999px",
                        padding: "6px 16px",
                        fontSize: "0.75rem",
                        fontFamily: "'Courier New', monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--color-gray-500)",
                        backgroundColor: "var(--color-white)",
                    }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "var(--color-success)", display: "inline-block", animation: "lp-pulse 2s ease-in-out infinite" }} />
                        Realistic Interview Practice Platform
                    </span>

                    {/* Headline */}
                    <h1 style={{
                        marginTop: "32px",
                        marginBottom: 0,
                        fontFamily: "'Courier New', monospace",
                        fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        color: "var(--color-gray-900)",
                    }}>
                        Practice Real Interviews.<br />
                        <span style={{ WebkitTextStroke: "1.5px var(--color-gray-900)", color: "transparent" }}>
                            Get Actionable AI Feedback.
                        </span><br />
                        Land More Offers.
                    </h1>

                    {/* Subheadline */}
                    <p style={{ marginTop: "28px", marginBottom: 0, fontSize: "1.15rem", color: "var(--color-gray-500)", maxWidth: "640px", margin: "28px auto 0", lineHeight: 1.65 }}>
                        AceMyInterview simulates realistic role-specific interviews, evaluates your answers with AI, and provides personalized feedback to help you improve faster.
                    </p>

                    {/* CTAs */}
                    <div style={{ marginTop: "40px", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <Link href="/signup" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            backgroundColor: "var(--color-gray-900)", color: "var(--color-white)",
                            borderRadius: "8px", padding: "14px 28px", fontWeight: 600,
                            fontSize: "0.95rem", textDecoration: "none",
                            transition: "background-color 0.2s ease",
                        }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-gray-700)")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--color-gray-900)")}
                        >
                            Start Free Interview <span>→</span>
                        </Link>
                        <Link href="#roles" style={{
                            display: "inline-flex", alignItems: "center",
                            border: "1px solid var(--color-gray-200)", color: "var(--color-gray-700)",
                            borderRadius: "8px", padding: "14px 28px", fontWeight: 500,
                            fontSize: "0.95rem", textDecoration: "none", backgroundColor: "var(--color-white)",
                            transition: "border-color 0.2s, background-color 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-gray-400)"; e.currentTarget.style.backgroundColor = "var(--color-gray-50)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-gray-200)"; e.currentTarget.style.backgroundColor = "var(--color-white)"; }}
                        >
                            Explore Roles
                        </Link>
                    </div>

                    {/* Quick Core Evaluation Dimensions Strip */}
                    <div style={{
                        marginTop: "56px",
                        display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "32px",
                        borderTop: "1px solid var(--color-gray-200)",
                        borderBottom: "1px solid var(--color-gray-200)",
                        padding: "20px 0",
                    }}>
                        {["Communication", "Technical Depth", "Problem Solving", "Answer Completeness"].map((metric) => (
                            <div key={metric} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "var(--color-success)", fontWeight: "bold" }}>✓</span>
                                <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, color: "var(--color-gray-600)" }}>{metric}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Problem → Solution Section ── */}
            <section className="container" style={{ position: "relative", zIndex: 1, padding: "48px 24px", maxWidth: "860px", margin: "0 auto" }}>
                <div style={{ backgroundColor: "var(--color-gray-50)", border: "1px solid var(--color-gray-200)", borderRadius: "16px", padding: "40px" }}>
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gray-400)" }}>The Prep Gap</span>
                    <h2 style={{ marginTop: "8px", marginBottom: "24px", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-gray-900)", letterSpacing: "-0.02em" }}>Stop Going Into Interviews Unprepared</h2>

                    <p style={{ color: "var(--color-gray-500)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "24px" }}>
                        Most candidates struggle because they memorize answers, watch endless interview videos, or practice alone without feedback.
                    </p>

                    <div style={{ borderLeft: "3px solid var(--color-gray-900)", paddingLeft: "20px", marginTop: "20px" }}>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--color-gray-900)", fontSize: "1.05rem" }}>The AceMyInterview Solution:</p>
                        <p style={{ margin: "4px 0 0 0", color: "var(--color-gray-600)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                            A structured, voice-powered interview environment where you can practice raw conversational loops, receive exhaustive metric-driven evaluations, and map out your weak concepts before they cost you the job.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Section Divider ── */}
            <div id="roles" className="container" style={{ position: "relative", zIndex: 1, margin: "40px auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-gray-200)" }} />
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gray-400)", whiteSpace: "nowrap" }}>Core Capabilities</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-gray-200)" }} />
                </div>
            </div>

            {/* ── Core Features Section ── */}
            <section className="container" style={{ position: "relative", zIndex: 1, padding: "24px 24px 64px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                    {[
                        {
                            tag: "Role-Specific Mocks",
                            title: "Tailored to Your Target Role",
                            description: "Whether you're SWE, Frontend, Backend, Data Science, or Product Management—interviews pull directly from curated question banks matching real-world patterns.",
                            bullets: ["Curated pattern questions", "Multiple difficulty levels", "Realistic interview flow"]
                        },
                        {
                            tag: "AI Evaluation",
                            title: "Deep Metrics Over Simple Scores",
                            description: "AI breaks down your performance across technical depth, communication clarity, problem-solving paths, and overall interview readiness.",
                            bullets: ["Rubric breakdowns", "Verdict and score logs", "Question-level timelines"]
                        },
                        {
                            tag: "Custom Roadmap",
                            title: "Know Exactly What to Fix",
                            description: "No generic tips. The platform targets exact structural gaps, highlights missing conceptual terminology, and drops recommended study items.",
                            bullets: ["Identifies core gaps", "Practical actionable fixes", "Personalized study paths"]
                        },
                        {
                            tag: "Voice Experience",
                            title: "Natural Audio Simulations",
                            description: "Simulate pressure cleanly with speech-to-text answering, native audio narration pipelines, and synchronized word-by-word highlighted text readbacks.",
                            bullets: ["Speech-to-text conversion", "Natural query narration", "Real dialogue matching"]
                        },
                        {
                            tag: "Expert Guidance",
                            title: "High-Quality Reference Responses",
                            description: "Compare your spoken outputs step-by-step against sample target profiles to isolate exactly what interviewers wanted to hear.",
                            bullets: ["Benchmark answers", "Expectation rubrics", "Strategic context shifts"]
                        },
                        {
                            tag: "Secure Tracking",
                            title: "Measurable Growth Dashboards",
                            description: "Securely review previous history, check dynamic historical progress trends, download comprehensive PDF reports, and confirm your real readiness timeline.",
                            bullets: ["Historical score analytics", "Downloadable PDF reports", "Secure session vaults"]
                        }
                    ].map(({ tag, title, description, bullets }) => (
                        <div key={tag} className="card" style={{ border: "1px solid var(--color-gray-200)", borderRadius: "12px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "box-shadow 0.2s, transform 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                        >
                            <div>
                                <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gray-400)" }}>{tag}</span>
                                <h3 style={{ marginTop: "12px", marginBottom: "12px", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.4, color: "var(--color-gray-900)" }}>{title}</h3>
                                <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "var(--color-gray-500)", lineHeight: 1.6 }}>{description}</p>

                                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.85rem", color: "var(--color-gray-700)", lineHeight: 1.7 }}>
                                    {bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                                </ul>
                            </div>
                            <div style={{ marginTop: "24px", height: "1px", width: "100%", backgroundColor: "var(--color-gray-100)" }} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Why AceMyInterview ── */}
            <section className="container" style={{ position: "relative", zIndex: 1, padding: "0 24px 64px" }}>
                <div style={{ backgroundColor: "var(--color-gray-900)", borderRadius: "16px", padding: "48px 40px" }}>
                    <div style={{ marginBottom: "40px" }}>
                        <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gray-500)" }}>Why Us</span>
                        <h2 style={{ marginTop: "12px", marginBottom: 0, fontSize: "1.75rem", fontWeight: 700, color: "var(--color-white)", letterSpacing: "-0.02em" }}>Practice Smarter. Learn Faster.</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                        {[
                            { title: "Realistic Practice", body: "Experience real structured interview-like pressure directly inside your browser window." },
                            { title: "Instant Feedback", body: "No waiting for mentors, peers, or senior reviews. Get precision diagnostic reports immediately." },
                            { title: "Build Raw Confidence", body: "Practice heavy, reduce conversational friction, and show up ready to face real interview panels." },
                            { title: "Accessible Anywhere", body: "Complete platform tooling with native audio loops, custom dash parameters, and offline-ready outputs." },
                        ].map(({ title, body }) => (
                            <div key={title} style={{ borderLeft: "1px solid var(--color-gray-700)", paddingLeft: "16px" }}>
                                <h3 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-white)" }}>{title}</h3>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-gray-400)", lineHeight: 1.6 }}>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Social Proof / User Audience ── */}
            <section className="container" style={{ position: "relative", zIndex: 1, padding: "20px 24px 64px", textAlign: "center" }}>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gray-400)" }}>Designed For Serious Job Seekers</span>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
                    {["Preparing for Internships", "Applying for Entry-Level", "Switching Careers", "Targeting Senior Positions"].map((target) => (
                        <span key={target} style={{
                            border: "1px solid var(--color-gray-200)",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            backgroundColor: "var(--color-gray-50)",
                            color: "var(--color-gray-700)"
                        }}>
                            {target}
                        </span>
                    ))}
                </div>
            </section>

            {/* ── Final Value Prop & CTA ── */}
            <section className="container" style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
                <div style={{
                    position: "relative", overflow: "hidden",
                    border: "1px solid var(--color-gray-200)",
                    borderRadius: "16px", padding: "64px 32px",
                    textAlign: "center", backgroundColor: "var(--color-gray-50)",
                }}>
                    {/* Corner accents */}
                    <div style={{ position: "absolute", top: "-1px", left: "-1px", width: "40px", height: "40px", borderTop: "2px solid var(--color-gray-900)", borderLeft: "2px solid var(--color-gray-900)", borderRadius: "16px 0 0 0" }} />
                    <div style={{ position: "absolute", top: "-1px", right: "-1px", width: "40px", height: "40px", borderTop: "2px solid var(--color-gray-900)", borderRight: "2px solid var(--color-gray-900)", borderRadius: "0 16px 0 0" }} />
                    <div style={{ position: "absolute", bottom: "-1px", left: "-1px", width: "40px", height: "40px", borderBottom: "2px solid var(--color-gray-900)", borderLeft: "2px solid var(--color-gray-900)", borderRadius: "0 0 0 16px" }} />
                    <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "40px", height: "40px", borderBottom: "2px solid var(--color-gray-900)", borderRight: "2px solid var(--color-gray-900)", borderRadius: "0 0 16px 0" }} />

                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-gray-400)" }}>Get started</span>
                    <h2 style={{ marginTop: "16px", marginBottom: 0, fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-gray-900)", lineHeight: 1.2 }}>
                        Your next interview is closer than you think.
                    </h2>
                    <p style={{ marginTop: "16px", marginBottom: 0, fontSize: "0.95rem", color: "var(--color-gray-500)", maxWidth: "580px", margin: "16px auto 0", lineHeight: 1.65 }}>
                        Stop guessing what interviewers want to hear. AceMyInterview combines realistic mock sessions, voice interaction, and data-backed evaluations into a single performance workbench.
                    </p>
                    <Link href="/signup" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        marginTop: "32px",
                        backgroundColor: "var(--color-gray-900)", color: "var(--color-white)",
                        borderRadius: "8px", padding: "14px 28px",
                        fontWeight: 600, fontSize: "0.95rem", textDecoration: "none",
                        transition: "background-color 0.2s ease",
                    }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-gray-700)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--color-gray-900)")}
                    >
                        Start for free →
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ borderTop: "1px solid var(--color-gray-200)", padding: "28px 24px" }}>
                <div className="container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-gray-900)" }}>AceMyInterview</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>© 2026 • Built to help candidates practice and improve.</span>
                </div>
            </footer>

            <style>{`
                @keyframes lp-pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.4; }
                }
            `}</style>
        </main>
    );
}