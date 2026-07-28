'use client';

import { useEffect } from 'react';

import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { AnimatePresence, m } from 'framer-motion';

import {
  SERMON_BLOCK_VARIANTS,
  SERMON_CONTENT_VARIANTS,
} from '../_constants/sermon-motion';
import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonBody } from './sermon-body';
import { SermonContentInfo } from './sermon-content-info';
import { SermonFooter } from './sermon-footer';
import { SermonStatus } from './sermon-status';

interface SermonContentProps {
  videoId: string;
}

export function SermonContent({ videoId }: SermonContentProps) {
  const { data, isLoading, error } = useSermonData({ videoId });

  useEffect(() => {
    if (!error) return;

    console.error(`설교 데이터 로딩 실패: ${error}`);
  }, [error]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <SermonStatus key="loading">
          <Spinner className="text-muted-foreground size-6" />
        </SermonStatus>
      ) : error ? (
        <SermonStatus key="error">
          <p>말씀을 불러오는 중에 문제가 발생했어요</p>
        </SermonStatus>
      ) : !data ? (
        <SermonStatus key="empty">
          <p>아직 마음판에 새겨진 말씀이 없어요</p>
        </SermonStatus>
      ) : (
        <m.div
          key="content"
          className="flex flex-1 flex-col items-center justify-center"
          variants={SERMON_CONTENT_VARIANTS}
          initial="hidden"
          animate="visible">
          <SermonBody summary={data.summary} />
          <m.div className="w-full" variants={SERMON_BLOCK_VARIANTS}>
            <Separator className="mt-16 mb-4" />
          </m.div>
          <m.div className="w-full" variants={SERMON_BLOCK_VARIANTS}>
            <SermonContentInfo
              originalUrl={data.originalUrl}
              savedAt={data.savedAt}
            />
          </m.div>
          <m.div className="w-full" variants={SERMON_BLOCK_VARIANTS}>
            <SermonFooter />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
