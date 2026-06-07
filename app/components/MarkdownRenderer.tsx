// app/components/MarkdownRenderer.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
            {content}
        </ReactMarkdown>
    );
}