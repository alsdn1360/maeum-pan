'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { APP_PATH } from '@/constants/app-path';
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
  const [copied, setCopied] = useState(false);
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

  const handleShare = async () => {
    const url = window.location.href;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span className="hidden sm:block">
            {copied ? '링크 복사됨' : '말씀 공유'}
          </span>
        </Button>

        <SermonDeleteDialog videoId={videoId} />
      </div>
    </header>
  );
};
