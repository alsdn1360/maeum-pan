'use client';

import {
  arrowLeftIcon,
  imageDownloadIcon,
  shareIcon,
} from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { APP_PATH } from '@/constants/app-path';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useCaptureSermon } from '../_hooks/use-capture-sermon';
import { useKakaoShare } from '../_hooks/use-kakao-share';
import { useScrollThreshold } from '../_hooks/use-scroll-thresold';
import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonDeleteDialog } from './sermon-delete-dialog';

interface SermonHeaderProps {
  videoId: string;
}

export function SermonHeader({ videoId }: SermonHeaderProps) {
  const { isScrolled } = useScrollThreshold({ threshold: 0 });
  const { data } = useSermonData({ videoId });

  const { isCapturing, handleCaptureSermonCard } = useCaptureSermon();
  const { handleShareSermon } = useKakaoShare();

  const sermonTitle = data
    ? extractSermonTitle({ summary: data.summary })
    : '은혜롭게 주시는 말씀';

  return (
    <header
      className={cn(
        'bg-background sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b p-4 transition-all duration-200 ease-in-out',
        isScrolled ? 'border-border' : 'border-transparent',
      )}>
      <Button
        variant="ghost"
        size="responsive-icon"
        nativeButton={false}
        render={<Link href={APP_PATH.MAIN} />}>
        {arrowLeftIcon}
        <span className="hidden sm:block">뒤로가기</span>
      </Button>

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

        <Button
          variant="outline"
          size="responsive-icon"
          onClick={() => handleShareSermon(videoId, sermonTitle)}
          disabled={isCapturing}>
          {shareIcon}
          <span className="hidden sm:block">말씀 나누기</span>
        </Button>

        <SermonDeleteDialog videoId={videoId} isCapturing={isCapturing} />
      </div>
    </header>
  );
}
