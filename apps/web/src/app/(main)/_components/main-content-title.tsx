'use client';

import { createTransition } from '@/lib/motion';
import { motion } from 'framer-motion';

export function MainContentTitle() {
  return (
    <motion.h1
      className="text-2xl"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={createTransition()}>
      마음판
    </motion.h1>
  );
}
