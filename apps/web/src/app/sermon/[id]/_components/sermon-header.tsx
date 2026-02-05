'use client';

import { useState } from 'react';

import {
  arrowLeftIcon,
  imageDownloadIcon,
  shareIcon,
} from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { APP_BASE_URL, APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { takeSermonCache } from '@/lib/sermon-cache';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import Link from 'next/link';

import { SERMON_CAPTURE_AREA_ID } from '../_constants/sermon-capture';
import { useScrollThreshold } from '../_hooks/use-scroll-thresold';
import { SermonDeleteDialog } from './sermon-delete-dialog';

const PADDING_X = 16;
const PADDING_Y = 32;

const getSermonTitle = (videoId: string) => {
  const sermonFromCache = takeSermonCache(videoId);

  if (sermonFromCache) {
    return extractSermonTitle({ summary: sermonFromCache.summary });
  } else {
    const sermonFromStorage =
      typeof window !== 'undefined'
        ? localStorage.getItem(`sermon-${videoId}`)
        : null;

    if (sermonFromStorage) {
      const sermon = JSON.parse(sermonFromStorage);

      return extractSermonTitle({ summary: sermon.summary });
    }
  }
};

interface SermonHeaderProps {
  videoId: string;
}

export function SermonHeader({ videoId }: SermonHeaderProps) {
  const { isScrolled } = useScrollThreshold({ threshold: 0 });
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    const element = document.getElementById(SERMON_CAPTURE_AREA_ID);

    if (!element) {
      alert('담을 말씀을 찾을 수 없습니다.');

      return;
    }

    setIsCapturing(true);

    try {
      await document.fonts.ready;

      const sermonTitle = getSermonTitle(videoId);
      const currentBgColor = window.getComputedStyle(element).backgroundColor;
      const width = element.scrollWidth + PADDING_X * 2;
      const height = element.scrollHeight + PADDING_Y * 2;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        width: width,
        height: height,
        pixelRatio: 2,

        style: {
          backgroundColor: currentBgColor,
          padding: `${PADDING_Y}px ${PADDING_X}px`,
          margin: '0',
          width: '100%',
          height: 'auto',
          maxWidth: 'none',
          transform: 'none',
          WebkitFontSmoothing: 'antialiased',
          fontSmooth: 'antialiased',
        } as Partial<CSSStyleDeclaration>,
      });

      const link = document.createElement('a');

      link.download = `마음판-말씀 카드-${sermonTitle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('말씀 카드 캡처 실패:', err);
      alert('말씀 카드에 말씀을 담는 중에 문제가 발생했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShare = () => {
    const { Kakao } = window;

    if (!Kakao || !Kakao.Share) {
      alert('카카오톡 공유 기능을 불러오지 못했습니다.');

      return;
    }

    const url = buildUrlWithParams({
      url: APP_BASE_URL + APP_PATH.SERMON,
      pathParams: { videoId },
    });
    const sermonTitle = getSermonTitle(videoId);

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '마음에 새긴 은혜를 나눕니다 💌',
        description: sermonTitle,
        imageUrl: '',
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: '말씀 보러가기',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  };

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
          onClick={handleCapture}
          disabled={isCapturing}>
          {isCapturing ? <Spinner /> : imageDownloadIcon}
          <span className="hidden sm:block">
            {isCapturing ? '말씀 담는 중...' : '말씀 카드로 저장하기'}
          </span>
        </Button>

        <Button
          variant="outline"
          size="responsive-icon"
          onClick={handleShare}
          disabled={isCapturing}>
          {shareIcon}
          <span className="hidden sm:block">말씀 나누기</span>
        </Button>

        <SermonDeleteDialog videoId={videoId} isCapturing={isCapturing} />
      </div>
    </header>
  );
}
