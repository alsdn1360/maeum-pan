import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

interface SermonBodyProps {
  summary: string;
}

export function SermonBody({ summary }: SermonBodyProps) {
  return (
    <article className="prose prose-lg dark:prose-invert text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
    </article>
  );
}
