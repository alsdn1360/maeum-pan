'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

const LOADING_MESSAGES = [
  '목사님의 말씀을 귀담아듣고 있습니다',
  '은혜로운 내용을 선별하고 있습니다',
  '마음판에 새길 준비를 하고 있습니다',
  '잠시만 기다려주세요',
];

const ROTATION_INTERVAL = 4000;

export const RotatingLoadingMessage = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.p
      key={LOADING_MESSAGES[msgIndex]}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: [1, 0.5, 1],
        y: 0,
      }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        y: {
          duration: 0.5,
          ease: 'easeOut',
        },
        opacity: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: 0.1,
        },
      }}
      className="text-muted-foreground absolute inset-x-0 top-0 text-xs font-bold">
      {LOADING_MESSAGES[msgIndex]}
    </motion.p>
  );
};
