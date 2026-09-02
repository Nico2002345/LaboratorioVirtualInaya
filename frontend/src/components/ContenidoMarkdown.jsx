import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ContenidoMarkdown.css";

export default function ContenidoMarkdown({ texto }) {
  if (!texto) return null;
  return (
    <div className="markdown-cuerpo">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{texto}</ReactMarkdown>
    </div>
  );
}
