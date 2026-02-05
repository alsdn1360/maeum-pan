'use client';

import { AnimatePresence, motion } from 'framer-motion';

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
    <div className="relative h-4 w-full text-center">
      <AnimatePresence mode="wait">
        {errorMsg ? (
          <motion.p
            key="error-msg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-destructive absolute inset-x-0 top-0 text-xs font-bold">
            {errorMsg}
          </motion.p>
        ) : isLoading ? (
          <RotatingLoadingMsg key="loading-msg" />
        ) : (
          <motion.p
            key="default-msg"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground absolute inset-x-0 top-0 text-xs">
            자막이 없는 영상은 지원하지 않습니다
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
