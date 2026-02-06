'use client';

import { SermonListSheet } from '@/app/(main)/_components/sermon-list-sheet';
import { homeIcon, imageDownloadIcon } from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { APP_BASE_URL, APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useCaptureSermon } from '../_hooks/use-capture-sermon';
import { useScrollThreshold } from '../_hooks/use-scroll-thresold';
import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonDeleteDialog } from './sermon-delete-dialog';
import { SermonShareDialog } from './sermon-share-dialog';

interface SermonHeaderProps {
  videoId: string;
}

export function SermonHeader({ videoId }: SermonHeaderProps) {
  const { isScrolled } = useScrollThreshold({ threshold: 0 });
  const { data } = useSermonData({ videoId });

  const { isCapturing, handleCaptureSermonCard } = useCaptureSermon();

  const sermonTitle = data
    ? extractSermonTitle({ summary: data.summary })
    : '은혜롭게 주시는 말씀';

  const url = buildUrlWithParams({
    url: APP_BASE_URL + APP_PATH.SERMON,
    pathParams: { videoId },
  });

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-16 w-full items-center justify-between p-4 transition-all duration-300 ease-in-out',
        isScrolled
          ? 'bg-background/70 shadow-xs backdrop-blur-sm'
          : 'bg-background',
      )}>
      <div className="flex gap-2">
        <SermonListSheet />
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href={APP_PATH.MAIN} />}>
          {homeIcon}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="responsive-icon"
          onClick={() => handleCaptureSermonCard(sermonTitle)}
          disabled={isCapturing}>
          {isCapturing ? <Spinner /> : imageDownloadIcon}
          <span className="hidden sm:block">
            {isCapturing ? '말씀 담는 중...' : '말씀 카드로 저장하기'}
          </span>
        </Button>

        <SermonShareDialog
          videoId={videoId}
          sermonTitle={sermonTitle}
          url={url}
        />

        <SermonDeleteDialog videoId={videoId} isCapturing={isCapturing} />
      </div>
    </header>
  );
}
