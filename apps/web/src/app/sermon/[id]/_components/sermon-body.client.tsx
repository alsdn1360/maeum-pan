'use client';

import { useLayoutEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import Loading from '@/app/loading';
import { Separator } from '@/components/ui/separator';
import { type SermonCacheData, takeSermonCache } from '@/lib/sermon-cache';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';

import { SermonDeleteDialog } from './sermon-delete-dialog';

interface SermonBodyProps {
  videoId: string;
}

export const SermonBody = ({ videoId }: SermonBodyProps) => {
  const [data, setData] = useState<SermonCacheData | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  useLayoutEffect(() => {
    const fromCache = takeSermonCache(videoId);

    if (fromCache) {
      // 마운트 직후 외부 저장소에서 초기값만 읽어오는 1회성 동기화
      // eslint-disable-next-line react-hooks/set-state-in-effect -- external store hydration
      setData(fromCache);

      setIsResolved(true);

      return;
    }

    const savedJson =
      typeof window !== 'undefined'
        ? localStorage.getItem(`sermon-${videoId}`)
        : null;

    if (savedJson) {
      try {
        setData(JSON.parse(savedJson));
      } catch {
        // ignore
      }
    }

    setIsResolved(true);
  }, [videoId]);

  if (!isResolved) {
    return <Loading />;
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-center">
        아직 마음판에 새겨진 말씀이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <article className="prose prose-neutral prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.summary}
        </ReactMarkdown>
      </article>

      <Separator className="mt-16 mb-4" />

      <div className="flex flex-col items-end justify-between gap-8">
        <div className="flex flex-col items-end gap-1">
          <Link
            href={data.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground ml-4 line-clamp-1 text-sm break-all transition-colors">
            {data.originalUrl}
          </Link>
          <p className="text-muted-foreground text-sm">
            {data.sermonDate || '날짜 미상'} 설교
          </p>
        </div>

        <SermonDeleteDialog videoId={videoId} />
      </div>
    </div>
  );
};
