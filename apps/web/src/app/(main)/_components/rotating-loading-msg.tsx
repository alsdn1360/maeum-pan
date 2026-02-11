'use client';

import { createTransition } from '@/lib/motion';
import { AnimatePresence, m } from 'framer-motion';

import { LOADING_MSGS } from '../_constants/loading-msg';
import { useRotatingLoadingMsg } from '../_hooks/use-rotating-loading-msg';

export function RotatingLoadingMsg() {
  const { msgIndex } = useRotatingLoadingMsg();

  return (
    <div className="relative h-4 animate-pulse overflow-hidden">
      <AnimatePresence mode="popLayout">
        <m.p
          key={LOADING_MSGS[msgIndex]}
          className="absolute inset-x-0 top-0 text-xs"
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={createTransition()}>
          {LOADING_MSGS[msgIndex]}
        </m.p>
      </AnimatePresence>
    </div>
  );
}
