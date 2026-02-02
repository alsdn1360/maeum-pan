'use client';

import { useLayoutEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { type SermonCacheData, takeSermonCache } from '@/lib/sermon-cache';
import remarkGfm from 'remark-gfm';

type Props = {
  id: string;
};

const SermonLoadingSkeleton = () => {
  return (
    <div className="animate-in fade-in mx-auto max-w-3xl px-4 py-10 duration-200">
      <div className="mb-8 border-b pb-4">
        <div className="bg-muted h-8 w-48 rounded-md" />
        <div className="bg-muted mt-3 h-4 w-64 rounded-md" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-muted h-4 rounded-md"
            style={{ width: `${80 - i * 5}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const SermonBody = ({ id }: Props) => {
  const [data, setData] = useState<SermonCacheData | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  useLayoutEffect(() => {
    const fromCache = takeSermonCache(id);

    if (fromCache) {
      // 마운트 직후 외부 저장소에서 초기값만 읽어오는 1회성 동기화
      // eslint-disable-next-line react-hooks/set-state-in-effect -- external store hydration
      setData(fromCache);

      setIsResolved(true);

      return;
    }

    const savedJson =
      typeof window !== 'undefined'
        ? localStorage.getItem(`sermon-${id}`)
        : null;

    if (savedJson) {
      try {
        setData(JSON.parse(savedJson));
      } catch {
        // ignore
      }
    }

    setIsResolved(true);
  }, [id]);

  if (!isResolved) {
    return <SermonLoadingSkeleton />;
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-center">
        아직 마음판에 새겨진 말씀이 없습니다.
      </p>
    );
  }

  return (
    <article className="prose prose-neutral prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.summary}</ReactMarkdown>
    </article>
  );
};
