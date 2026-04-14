import React from 'react';

interface EditorialContentProps {
  content: string;
  className?: string;
}

/**
 * Automatically formats editorial content.
 * If HTML is detected, it renders it directly.
 * If plain text is detected, it transforms it into structured HTML with paragraphs and lists.
 */
export const EditorialContent: React.FC<EditorialContentProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Simple check for HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div 
        className={`prose prose-sm max-w-none text-gray-600 leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Plain text processing
  const lines = content.split('\n').map(line => line.trim());
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 space-y-1 my-4">
          {currentList.map((item, i) => (
            <li key={i} className="text-sm text-gray-600">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  let elementKey = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!line) {
      flushList(elementKey++);
      continue;
    }

    // Detect bullet points
    const bulletMatch = line.match(/^[-*•]\s*(.+)/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
    } else {
      flushList(elementKey++);
      
      // Detect potential headings (short lines, no ending punctuation, or all caps)
      const isShort = line.length < 50;
      const noPunctuation = !/[.!?]$/.test(line);
      const isLikelyHeading = isShort && (noPunctuation || line === line.toUpperCase());

      if (isLikelyHeading && i < lines.length - 1 && lines[i+1]) {
        elements.push(
          <h4 key={elementKey++} className="font-black text-gray-900 mt-6 mb-2 text-base">
            {line}
          </h4>
        );
      } else {
        elements.push(
          <p key={elementKey++} className="text-sm text-gray-600 leading-relaxed mb-4">
            {line}
          </p>
        );
      }
    }
  }
  
  flushList(elementKey++);

  return (
    <div className={`editorial-content ${className}`}>
      {elements}
    </div>
  );
};
