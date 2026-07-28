import { createTransition } from '@/lib/motion';
import { type Transition, type Variants } from 'framer-motion';

/** 블록 하나가 다음 블록보다 앞서 등장하는 간격(초).
 *  본문 블록 12~16개 + 구분선·출처·푸터 3개 기준 전체 캐스케이드가 약 0.75~0.95초. */
const BLOCK_STAGGER = 0.05;
const BLOCK_DISTANCE = 12;
const STATUS_DURATION = 0.25;

export const SERMON_CONTENT_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: BLOCK_STAGGER },
  },
};

export const SERMON_BLOCK_VARIANTS: Variants = {
  hidden: { opacity: 0, y: BLOCK_DISTANCE },
  visible: { opacity: 1, y: 0, transition: createTransition() },
};

export const SERMON_STATUS_TRANSITION: Transition = createTransition({
  duration: STATUS_DURATION,
});
