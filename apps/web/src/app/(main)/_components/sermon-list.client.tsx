'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { type SermonCacheData } from '@/lib/sermon-cache';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

const PAGE_SIZE = 3;

type SermonItem = {
  id: string;
  data: SermonCacheData;
};

export const SermonList = () => {
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const items: SermonItem[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith('sermon-')) {
          const id = key.replace('sermon-', '');
          const json = localStorage.getItem(key);

          if (json) {
            try {
              const data = JSON.parse(json) as SermonCacheData;

              items.push({ id, data });
            } catch {}
          }
        }
      }

      items.sort(
        (a, b) =>
          new Date(b.data.savedAt).getTime() -
          new Date(a.data.savedAt).getTime(),
      );

      setSermons(items);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;

      setIsScrolled(scrollTop > 0);
      setCanScrollMore(scrollTop + clientHeight < scrollHeight - 1);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [visibleCount, sermons]);

  if (sermons.length === 0) {
    return null;
  }

  const visibleSermons = sermons.slice(0, visibleCount);
  const hasMore = visibleCount < sermons.length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="relative">
        <div
          className={`from-background pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b to-transparent transition-opacity ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-linear-to-t to-transparent transition-opacity ${
            canScrollMore ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <ul
          ref={listRef}
          onScroll={handleScroll}
          className="flex max-h-48 flex-col overflow-y-auto">
          {visibleSermons.map(({ id, data }) => (
            <li key={id}>
              <Link
                href={`/sermon/${id}`}
                className="text-muted-foreground hover:text-foreground flex items-center justify-between gap-2 py-2 transition-colors">
                <span className="line-clamp-1 max-w-64 truncate text-sm">
                  {data.summary.split('\n')[0]?.replace(/^#*\s*/, '') ||
                    '제목 없음'}
                </span>
                <span className="text-muted-foreground text-xs">
                  {data.sermonDate || '날짜 미상'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className="text-muted-foreground self-center text-xs">
          더보기 ({sermons.length - visibleCount}개 더)
        </Button>
      )}

      <div className="text-muted-foreground flex items-center justify-center gap-1.5">
        <HugeiconsIcon icon={AlertCircleIcon} size={12} />
        <p className="text-xs">
          인터넷 기록 삭제 시, 저장된 설교 목록도 삭제됩니다
        </p>
      </div>
    </div>
  );
};
