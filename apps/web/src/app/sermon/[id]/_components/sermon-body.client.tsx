'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { getSermon } from '@/api/main/get-sermon/get';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';
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
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useLayoutEffect(() => {
    const fromCache = takeSermonCache(videoId);

    if (fromCache) {
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
        setIsResolved(true);
      } catch {
        /* empty */
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (isResolved || data) {
      return;
    }

    const fetchFromBackend = async () => {
      try {
        const response = await getSermon(videoId);

        const sermonData: SermonCacheData = {
          videoId: response.videoId,
          summary: response.summary,
          createdAt: response.createdAt,
          originalUrl: `https://www.youtube.com/watch?v=${response.videoId}`,
          savedAt: new Date().toISOString(),
          isNonSermon: response.isNonSermon,
        };

        localStorage.setItem(`sermon-${videoId}`, JSON.stringify(sermonData));
        setData(sermonData);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : '말씀을 불러오는데 실패했습니다.',
        );
      } finally {
        setIsResolved(true);
      }
    };

    fetchFromBackend();
  }, [videoId, isResolved, data]);

  if (!isResolved) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <p className="text-muted-foreground my-auto h-full text-center">
        아직 마음판에 새겨진 말씀이 없습니다
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
            마음에 담은 날:{' '}
            {data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('ko-KR')
              : '날짜 미상'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            {copied ? '복사됨!' : '링크 공유'}
          </Button>
          <SermonDeleteDialog videoId={videoId} />
        </div>
      </div>
    </div>
  );
};
