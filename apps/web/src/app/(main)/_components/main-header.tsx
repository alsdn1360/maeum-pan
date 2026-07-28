'use client';

import { useScrollContainer } from '@/components/common/scroll-layout';
import { SermonListSheet } from '@/components/common/sermon-list-sheet';
import { useScrollProgress } from '@/lib/use-scroll-progress';
import { cn } from '@/lib/utils';

export function MainHeader() {
  const scrollRef = useScrollContainer();
  const { isScrolled } = useScrollProgress({ scrollRef });

  return (
    <header
      className={cn(
        'bg-background relative z-10 flex h-16 w-full shrink-0 items-center border-b p-4 transition-all duration-200 ease-in-out',
        isScrolled
          ? 'border-border dark:border-border/80'
          : 'border-transparent',
      )}>
      <SermonListSheet />
    </header>
  );
}
