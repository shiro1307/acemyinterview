import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                {content}
            </ReactMarkdown>
        </div>
    );
}
