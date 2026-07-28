'use client';

import { type PropsWithChildren, useRef } from 'react';

import { SermonHeader } from './sermon-header';

interface SermonScrollLayoutProps extends PropsWithChildren {
  videoId: string;
}

export function SermonScrollLayout({
  videoId,
  children,
}: SermonScrollLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden">
      <SermonHeader videoId={videoId} scrollRef={scrollRef} />

      {/* 스크롤 주체를 헤더 아래 컨테이너로 두어야 스크롤바가 헤더를 덮지 않는다. */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </main>
  );
}
