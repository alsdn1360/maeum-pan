'use client';

import { useState } from 'react';

import { useSermonList } from '@/app/(main)/_hooks/use-sermon-list';
import { Button } from '@/components/ui/button';

import { ScrollableList } from './scrollable-list.client';
import { SermonListItem } from './sermon-list-item';
import { SermonListTitleDialog } from './sermon-list-title-dialog';

const PAGE_SIZE = 3;

export const SermonList = () => {
  const sermonList = useSermonList();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (sermonList.length === 0) {
    return null;
  }

  const visibleSermons = sermonList.slice(0, visibleCount);
  const hasMore = visibleCount < sermonList.length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex flex-col gap-2">
        <SermonListTitleDialog />

        <ScrollableList deps={[visibleCount, sermonList]}>
          {visibleSermons.map((sermon) => (
            <SermonListItem key={sermon.id} sermon={sermon} />
          ))}
        </ScrollableList>
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className="text-muted-foreground self-center text-xs">
          더보기 ({sermonList.length - visibleCount}개 더)
        </Button>
      )}
    </div>
  );
};
