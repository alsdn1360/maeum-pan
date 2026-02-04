import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

interface SermonBodyProps {
  summary: string;
}

export const SermonBody = ({ summary }: SermonBodyProps) => {
  return (
    <article className="prose prose-neutral prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
    </article>
  );
};
