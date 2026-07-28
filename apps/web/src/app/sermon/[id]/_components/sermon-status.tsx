'use client';

import { type PropsWithChildren } from 'react';

import { m } from 'framer-motion';

import { SERMON_STATUS_TRANSITION } from '../_constants/sermon-motion';

/** 로딩·에러·빈값 상태를 담는 영역.
 *  헤더 h-16(64px) + 캡처 영역 pt-5(20px) + pb-4(16px) = 100px(6.25rem)를 빼면
 *  스크롤 컨테이너의 보이는 영역과 높이가 같아져 로딩 중 스크롤이 생기지 않는다. */
export function SermonStatus({ children }: PropsWithChildren) {
  return (
    <m.div
      className="flex min-h-[calc(100dvh-6.25rem)] w-full items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={SERMON_STATUS_TRANSITION}>
      {children}
    </m.div>
  );
}
