'use client';

import Loading from '@/app/loading';
import { Separator } from '@/components/ui/separator';

import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonBody } from './sermon-body';
import { SermonContentActions } from './sermon-content-actions';

interface SermonContentProps {
  videoId: string;
}

export const SermonContent = ({ videoId }: SermonContentProps) => {
  const { data, isResolved, error } = useSermonData(videoId);

  if (!isResolved) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="flex flex-1 items-center justify-center">
        아직 마음판에 새겨진 말씀이 없습니다
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <SermonBody summary={data.summary} />

      <Separator className="my-8" />

      <SermonContentActions
        originalUrl={data.originalUrl}
        createdAt={data.createdAt}
        videoId={videoId}
      />
    </div>
  );
};
