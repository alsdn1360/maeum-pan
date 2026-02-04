'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { APP_PATH } from '@/constants/app-path';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { takeSermonCache } from '@/lib/sermon-cache';
import { cn } from '@/lib/utils';
import { ArrowLeft02Icon, Share01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

import { SermonDeleteDialog } from './sermon-delete-dialog';

interface SermonHeaderProps {
  videoId: string;
}

const arrowLeftIcon = <HugeiconsIcon icon={ArrowLeft02Icon} />;
const shareIcon = <HugeiconsIcon icon={Share01Icon} />;

export const SermonHeader = ({ videoId }: SermonHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleShare = () => {
    const { Kakao } = window;
    const url = window.location.href;

    const sermonFromCache = takeSermonCache(videoId);

    let title;

    if (sermonFromCache) {
      title = extractSermonTitle({ summary: sermonFromCache.summary });
    } else {
      const sermonFromLocalStorage =
        typeof window !== 'undefined'
          ? localStorage.getItem(`sermon-${videoId}`)
          : null;

      if (sermonFromLocalStorage) {
        const sermon = JSON.parse(sermonFromLocalStorage);

        title = extractSermonTitle({ summary: sermon.summary });
      }
    }

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
        <Button variant="outline" size="responsive-icon" onClick={handleShare}>
          {shareIcon}
          <span className="hidden sm:block">말씀 공유하기</span>
        </Button>

        <SermonDeleteDialog videoId={videoId} />
      </div>
    </header>
  );
};
