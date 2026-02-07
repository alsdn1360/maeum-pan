'use client';

import { motion } from 'framer-motion';

export function MainContentDescrition() {
  return (
    <motion.div
      className="flex flex-col text-center leading-relaxed"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.1,
        ease: [0, 0, 0.2, 1],
      }}>
      <p>흘러가는 말씀을 마음에 새기세요</p>
      <p className="text-muted-foreground text-sm">
        유튜브 설교 영상의 링크를 입력하면,
        <br className="block sm:hidden" /> 다시 묵상할 수 있도록 정리해 드립니다
      </p>
    </motion.div>
  );
}
