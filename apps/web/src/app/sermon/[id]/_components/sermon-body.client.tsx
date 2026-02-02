'use client';

import { useLayoutEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type SermonCacheData, takeSermonCache } from '@/lib/sermon-cache';
import Link from 'next/link';
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
            {data.sermonDate || '날짜 미상'}
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={() => {
            if (
              confirm(
                '정말 삭제하시겠습니까? 삭제된 말씀은 복구할 수 없습니다.',
              )
            ) {
              localStorage.removeItem(`sermon-${id}`);
              window.location.href = '/';
            }
          }}>
          삭제하기
        </Button>
      </div>
    </div>
  );
};
