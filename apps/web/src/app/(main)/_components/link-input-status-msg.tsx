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
    <div className="h-4 w-full text-center">
      <AnimatePresence mode="wait">
        {errorMsg ? (
          <motion.p
            key="error-msg"
            className="text-destructive text-xs font-bold"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}>
            {errorMsg}
          </motion.p>
        ) : isLoading ? (
          <RotatingLoadingMsg key="loading-msg" />
        ) : (
          <motion.p
            key="default-msg"
            className="text-muted-foreground text-xs"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0, 0, 0.2, 1],
            }}>
            자막이 없는 영상은 지원하지 않습니다
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
