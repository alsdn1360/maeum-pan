'use client';

import Loading from '@/app/loading';
import { Separator } from '@/components/ui/separator';

import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonBody } from './sermon-body';
import { SermonContentActions } from './sermon-content-actions';

interface SermonContentProps {
  videoId: string;
}

export function SermonContent({ videoId }: SermonContentProps) {
  const { data, isLoading, error } = useSermonData({ videoId });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    console.error(`설교 데이터 로딩 실패: ${error}`);

    return (
      <div className="flex flex-1 items-center justify-center">
        <p>말씀을 불러오는 중에 문제가 발생했어요</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>아직 마음판에 새겨진 말씀이 없어요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <SermonBody summary={data.summary} />
      <Separator className="my-8" />
      <SermonContentActions
        originalUrl={data.originalUrl}
        savedAt={data.savedAt}
      />
    </div>
  );
}
