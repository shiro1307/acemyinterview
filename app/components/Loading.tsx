interface LoadingProps {
    text?: string;
}

export default function Loading({ text = "Loading..." }: LoadingProps) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">{text}</div>
        </div>
    );
}
