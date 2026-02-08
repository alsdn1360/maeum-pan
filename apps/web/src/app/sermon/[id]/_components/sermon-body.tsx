'use client';

import ReactMarkdown from 'react-markdown';

import { createTransition } from '@/lib/motion';
import { motion } from 'framer-motion';
import remarkGfm from 'remark-gfm';

interface SermonBodyProps {
  summary: string;
}

export function SermonBody({ summary }: SermonBodyProps) {
  return (
    <motion.article
      className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground max-w-none"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={createTransition()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
    </motion.article>
  );
}
