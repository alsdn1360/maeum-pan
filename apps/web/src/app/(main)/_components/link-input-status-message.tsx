'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { RotatingLoadingMessage } from './rotating-loading-message';

interface LinkInputStatusMessageProps {
  errorMessage: string | null;
  isPending: boolean;
}

export const LinkInputStatusMessage = ({
  errorMessage,
  isPending,
}: LinkInputStatusMessageProps) => (
  <div className="relative h-4 w-full text-center">
    <AnimatePresence mode="wait">
      {errorMessage ? (
        <motion.p
          key="error-msg"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-destructive absolute inset-x-0 top-0 text-xs font-bold">
          {errorMessage}
        </motion.p>
      ) : isPending ? (
        <RotatingLoadingMessage key="loading-msg" />
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
