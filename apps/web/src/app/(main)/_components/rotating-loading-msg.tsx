'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { LOADING_MSGS } from '../_constants/loading-msg';
import { useRotatingLoadingMsg } from '../_hooks/use-rotating-loading-msg';

export function RotatingLoadingMsg() {
  const { msgIndex } = useRotatingLoadingMsg();

  return (
    <AnimatePresence>
      <motion.p
        key={LOADING_MSGS[msgIndex]}
        className="text-muted-foreground absolute inset-x-0 top-0 text-xs font-bold"
        initial={{ opacity: 0, y: 12, filter: 'blur(1px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(1px)' }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}>
        {LOADING_MSGS[msgIndex]}
      </motion.p>
    </AnimatePresence>
  );
}
