'use client';

import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

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

  if (isLoading) {
    return (
      <SermonStatus>
        <Spinner className="text-muted-foreground size-6" />
      </SermonStatus>
    );
  }

  if (error) {
    console.error(`설교 데이터 로딩 실패: ${error}`);

    return (
      <SermonStatus>
        <p>말씀을 불러오는 중에 문제가 발생했어요</p>
      </SermonStatus>
    );
  }

  if (!data) {
    return (
      <SermonStatus>
        <p>아직 마음판에 새겨진 말씀이 없어요</p>
      </SermonStatus>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <SermonBody summary={data.summary} />
      <Separator className="mt-16 mb-4" />
      <SermonContentInfo
        originalUrl={data.originalUrl}
        savedAt={data.savedAt}
      />
      <SermonFooter />
    </div>
  );
}
