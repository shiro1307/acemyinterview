"use client";

export default function PrintButton() {
    return (
        <button onClick={() => window.print()} className="print:hidden">
            Export to PDF
        </button>
    );
}