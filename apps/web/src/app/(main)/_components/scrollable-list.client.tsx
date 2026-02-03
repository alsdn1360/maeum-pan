'use client';

import { type ReactNode, type RefObject, useRef } from 'react';

import { useScrollFade } from '@/app/(main)/_hooks/use-scroll-fade';

interface ScrollableListProps {
  children: ReactNode;
  deps?: unknown[];
}

export const ScrollableList = ({
  children,
  deps = [],
}: ScrollableListProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const { isScrolled, canScrollMore, handleScroll } = useScrollFade(
    listRef as RefObject<HTMLUListElement>,
    deps,
  );

  return (
    <div className="relative">
      <div
        className={`from-background pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b to-transparent transition-opacity ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-linear-to-t to-transparent transition-opacity ${
          canScrollMore ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <ul
        ref={listRef}
        onScroll={handleScroll}
        className="flex max-h-48 flex-col overflow-y-auto">
        {children}
      </ul>
    </div>
  );
};
