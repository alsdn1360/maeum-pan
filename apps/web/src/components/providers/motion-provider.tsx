'use client';

import { type PropsWithChildren } from 'react';

import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';

export function MotionProvider({ children }: PropsWithChildren) {
  return (
    <LazyMotion strict features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
