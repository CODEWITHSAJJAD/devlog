import React from 'react';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  // Parse markdown lines into formatted HTML elements
  const lines = content.split('\n');

  return (
    <div className={`space-y-2 text-sm text-slate-300 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={idx} className="text-sm font-semibold text-white mt-3 mb-1">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} className="text-base font-semibold text-white mt-4 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>;
        }

        // Code block marker
        if (line.startsWith('```')) {
          return null; // Simplified line-by-line renderer
        }

        // Bullet point
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={idx} className="ml-4 list-disc text-slate-300">
              {line.slice(2)}
            </li>
          );
        }

        // Blockquote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-indigo-500/50 pl-3 italic text-slate-400 my-1">
              {line.slice(2)}
            </blockquote>
          );
        }

        // Inline code or empty line
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
};
