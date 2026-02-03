'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

const LOADING_MESSAGES = [
  '목사님의 말씀을 귀담아듣고 있습니다',
  '은혜로운 내용을 선별하고 있습니다',
  '마음판에 새길 준비를 하고 있습니다',
  '잠시만 기다려주세요',
];

const ROTATION_INTERVAL = 2500;

export const RotatingLoadingMessage = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.p
        key={LOADING_MESSAGES[msgIndex]}
        className="text-muted-foreground absolute inset-x-0 top-0 text-xs font-bold"
        initial={{ opacity: 0, y: 12, filter: 'blur(1px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(1px)' }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}>
        {LOADING_MESSAGES[msgIndex]}
      </motion.p>
    </AnimatePresence>
  );
};
