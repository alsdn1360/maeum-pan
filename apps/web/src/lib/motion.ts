import type { Transition } from 'framer-motion';

const EASE_OUT = [0, 0, 0.2, 1] as const;
const DEFAULT_DURATION = 0.5;

interface CreateTransitionOptions {
  delay?: number;
}

export function createTransition(
  options?: CreateTransitionOptions,
): Transition {
  return {
    duration: DEFAULT_DURATION,
    ease: EASE_OUT,
    ...(options?.delay !== undefined && { delay: options.delay }),
  };
}
