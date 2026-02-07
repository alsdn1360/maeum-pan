'use client';

import { motion } from 'framer-motion';

export function MainContentTitle() {
  return (
    <motion.h1
      className="text-2xl"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}>
      마음판
    </motion.h1>
  );
}
