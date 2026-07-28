'use client';

import { type ComponentType } from 'react';
import ReactMarkdown, {
  type Components,
  type ExtraProps,
} from 'react-markdown';

import { type HTMLMotionProps, m } from 'framer-motion';
import remarkGfm from 'remark-gfm';

import { SERMON_BLOCK_VARIANTS } from '../_constants/sermon-motion';

type BlockTag = 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'ul' | 'ol';

/** react-markdown이 넘기는 props를 그대로 살리려면 스프레드가 필요한데,
 *  두 라이브러리가 태그별 props를 다르게 모델링해 그대로는 맞지 않는다.
 *  framer-motion은 onDrag·onAnimationStart·style을 재정의하고,
 *  react-markdown은 태그마다 다른 HTMLElement 타입으로 좁힌다.
 *  런타임에는 문제가 없으므로 여기 두 군데서만 단언으로 넘긴다. */
const createMotionBlock = (tag: BlockTag) => {
  const MotionTag = m[tag] as ComponentType<HTMLMotionProps<'div'>>;

  function MotionBlock({ node, ...props }: HTMLMotionProps<'div'> & ExtraProps) {
    // node는 react-markdown의 hast 노드라 DOM으로 흘려보내면 안 된다.
    void node;

    return <MotionTag variants={SERMON_BLOCK_VARIANTS} {...props} />;
  }

  return MotionBlock;
};

/** 렌더마다 새로 만들면 ReactMarkdown이 트리를 리마운트해 등장 모션이 다시 돈다. */
const MARKDOWN_COMPONENTS = {
  h2: createMotionBlock('h2'),
  h3: createMotionBlock('h3'),
  h4: createMotionBlock('h4'),
  p: createMotionBlock('p'),
  blockquote: createMotionBlock('blockquote'),
  ul: createMotionBlock('ul'),
  ol: createMotionBlock('ol'),
} as Components;

interface SermonBodyProps {
  summary: string;
}

export function SermonBody({ summary }: SermonBodyProps) {
  return (
    <article className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}>
        {summary}
      </ReactMarkdown>
    </article>
  );
}
