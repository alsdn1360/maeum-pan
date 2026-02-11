'use client';

import { createTransition } from '@/lib/motion';
import { AnimatePresence, m } from 'framer-motion';

import { RotatingLoadingMsg } from './rotating-loading-msg';

interface LinkInputStatusMsgProps {
  errorMsg: string | null;
  isLoading: boolean;
}

export function LinkInputStatusMsg({
  errorMsg,
  isLoading,
}: LinkInputStatusMsgProps) {
  return (
    <div className="h-4 w-full text-center">
      <AnimatePresence mode="wait">
        {errorMsg ? (
          <m.p
            key="error-msg"
            className="text-destructive text-xs"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={createTransition()}>
            {errorMsg}
          </m.p>
        ) : isLoading ? (
          <RotatingLoadingMsg key="loading-msg" />
        ) : (
          <m.p
            key="default-msg"
            className="text-muted-foreground text-xs"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={createTransition({ delay: 0.1 })}>
            자막이 없는 영상은 지원하지 않습니다
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}
