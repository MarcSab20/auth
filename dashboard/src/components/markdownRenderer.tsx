import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  // Fonction pour décoder les entités HTML et nettoyer le contenu
  const cleanMarkdownContent = (rawContent: string): string => {
    return rawContent
      // Décoder les entités HTML
      .replace(/&#x20;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Nettoyer les échappements de markdown
      .replace(/\\(\*)/g, '$1')
      .replace(/\\(\|)/g, '$1')
      .replace(/\\(#)/g, '$1')
      .replace(/\\(_)/g, '$1')
      .replace(/\\(-)/g, '$1')
      .replace(/\\(\[)/g, '$1')
      .replace(/\\(\])/g, '$1')
      .replace(/\\(\()/g, '$1')
      .replace(/\\(\))/g, '$1')
      .replace(/\\(\{)/g, '$1')
      .replace(/\\(\})/g, '$1')
      .replace(/\\(<)/g, '$1')
      .replace(/\\(>)/g, '$1')
      // Nettoyer les doubles échappements
      .replace(/\\\\/g, '\\');
  };

  const cleanedContent = cleanMarkdownContent(content);

  return (
    <div className={`markdown-content ${className || ''}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Titres
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mt-5 mb-2 text-gray-900 leading-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mt-4 mb-2 text-gray-900 leading-tight">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-bold mt-3 mb-1 text-gray-900 leading-tight">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-bold mt-2 mb-1 text-gray-900 leading-tight">
              {children}
            </h6>
          ),

          // Paragraphes
          p: ({ children }) => (
            <p className="my-4 leading-relaxed text-gray-700">
              {children}
            </p>
          ),

          // Listes
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-4 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 leading-relaxed">
              {children}
            </li>
          ),

          // Texte formaté
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">
              {children}
            </em>
          ),

          // Liens
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Citations
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
              {children}
            </blockquote>
          ),

          // Code
          code: ({ children, className }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <code className={className}>
                {children}
              </code>
            ) : (
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-900">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-white rounded-lg p-4 my-4 overflow-x-auto">
              {children}
            </pre>
          ),

          // Tableaux
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-gray-200">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gray-50 border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-4 py-2 text-gray-700">
              {children}
            </td>
          ),

          // Séparateurs
          hr: () => (
            <hr className="border-gray-300 my-8" />
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="my-4 rounded-lg shadow-sm max-w-full h-auto"
            />
          ),

          // Texte barré
          del: ({ children }) => (
            <del className="line-through text-gray-500">
              {children}
            </del>
          ),
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;