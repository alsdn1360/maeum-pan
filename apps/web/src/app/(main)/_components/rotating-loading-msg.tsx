'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { LOADING_MSGS } from '../_constants/loading-msg';
import { useRotatingLoadingMsg } from '../_hooks/use-rotating-loading-msg';

export function RotatingLoadingMsg() {
  const { msgIndex } = useRotatingLoadingMsg();

  return (
    <div className="relative h-4 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.p
          key={LOADING_MSGS[msgIndex]}
          className="text-muted-foreground absolute inset-x-0 top-0 text-xs font-bold"
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}>
          {LOADING_MSGS[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
