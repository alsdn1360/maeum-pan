'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { APP_PATH } from '@/constants/app-path';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { takeSermonCache } from '@/lib/sermon-cache';
import { cn } from '@/lib/utils';
import {
  ArrowLeft02Icon,
  ImageDownload02Icon,
  Share01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { toPng } from 'html-to-image';
import Link from 'next/link';

import { SERMON_CAPTURE_AREA_ID } from '../_constants/sermon-capture';
import { SermonDeleteDialog } from './sermon-delete-dialog';

interface SermonHeaderProps {
  videoId: string;
}

const PADDING_X = 16;
const PADDING_Y = 32;

const arrowLeftIcon = <HugeiconsIcon icon={ArrowLeft02Icon} />;
const imageDownloadIcon = <HugeiconsIcon icon={ImageDownload02Icon} />;
const shareIcon = <HugeiconsIcon icon={Share01Icon} />;

const getSermonTitle = (videoId: string) => {
  const sermonFromCache = takeSermonCache(videoId);

  if (sermonFromCache) {
    return extractSermonTitle({ summary: sermonFromCache.summary });
  } else {
    const sermonFromLocalStorage =
      typeof window !== 'undefined'
        ? localStorage.getItem(`sermon-${videoId}`)
        : null;

    if (sermonFromLocalStorage) {
      const sermon = JSON.parse(sermonFromLocalStorage);

      return extractSermonTitle({ summary: sermon.summary });
    }
  }
};

export const SermonHeader = ({ videoId }: SermonHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCapture = async () => {
    const element = document.getElementById(SERMON_CAPTURE_AREA_ID);

    if (!element) {
      alert('캡처할 말씀을 찾을 수 없습니다.');

      return;
    }

    setIsCapturing(true);

    try {
      const title = getSermonTitle(videoId);

      const currentBgColor = window.getComputedStyle(element).backgroundColor;

      const width = element.scrollWidth + PADDING_X * 2;
      const height = element.scrollHeight + PADDING_Y * 2;

      const dataUrl = await toPng(element, {
        width: width,
        height: height,

        style: {
          backgroundColor: currentBgColor,
          padding: `${PADDING_Y}px ${PADDING_X}px`,
          margin: '0',
          width: '100%',
          height: 'auto',
          maxWidth: 'none',
          transform: 'none',
        },
      });

      const link = document.createElement('a');

      link.download = `마음판-${title}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('캡처 실패:', err);
      alert('말씀을 이미지로 저장하는동안 오류가 발생했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShare = () => {
    const { Kakao } = window;
    const url = window.location.href;

    const title = getSermonTitle(videoId);

    Kakao.Share.sendDefault({
      objectType: 'text',
      text: `마음판 : ${title}`,
      link: {
        mobileWebUrl: url,
        webUrl: url,
      },
      buttonTitle: '말씀 보기',
    });
  };

  return (
    <header
      className={cn(
        'bg-background sticky top-0 z-10 flex h-16 w-full items-center justify-between p-4 transition-colors duration-200',
        isScrolled ? 'border-border border-b' : 'border-b border-transparent',
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

        <Button variant="outline" size="responsive-icon" onClick={handleShare}>
          {shareIcon}
          <span className="hidden sm:block">은혜 나누기</span>
        </Button>

        <SermonDeleteDialog videoId={videoId} />
      </div>
    </header>
  );
};
