'use client';

import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useContext,
  useRef,
} from 'react';

const ScrollContainerContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

/** ScrollLayout이 소유한 스크롤 컨테이너의 ref를 꺼낸다.
 *  헤더는 스크롤 컨테이너 바깥에 있고 페이지가 서버 컴포넌트라
 *  ref를 prop으로 내릴 수 없어 context로 전달한다. */
export const useScrollContainer = () => {
  const scrollRef = useContext(ScrollContainerContext);

  if (!scrollRef) {
    throw new Error('useScrollContainer는 ScrollLayout 안에서만 쓸 수 있다.');
  }

  return scrollRef;
};

interface ScrollLayoutProps extends PropsWithChildren {
  header: ReactNode;
}

export function ScrollLayout({ header, children }: ScrollLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContainerContext value={scrollRef}>
      <main className="flex h-dvh w-full flex-col overflow-hidden">
        {header}

        {/* 스크롤 주체를 헤더 아래 컨테이너로 두어야 스크롤바가 헤더를 덮지 않고,
            문서가 스크롤되지 않아 오버스크롤 시 헤더가 밀리지 않는다. */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </main>
    </ScrollContainerContext>
  );
}
