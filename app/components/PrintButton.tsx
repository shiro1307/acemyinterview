"use client";

export default function PrintButton() {
    return (
        <button onClick={() => window.print()} className="printButton">
            Export to PDF
        </button>
    );
}