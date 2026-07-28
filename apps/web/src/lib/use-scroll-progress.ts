import { type RefObject, useEffect, useState } from 'react';

import { useMotionValue } from 'framer-motion';

interface UseScrollProgressProps {
  scrollRef: RefObject<HTMLElement | null>;
  threshold?: number;
}

/** 헤더 아래 스크롤 컨테이너의 진행률과 스크롤 여부를 추적한다.
 *  framer-motion의 useScroll은 layout effect에서 ref를 읽는데,
 *  컨테이너가 헤더보다 뒤에 선언되어 그 시점에는 아직 ref가 비어 있다.
 *  그래서 ref가 붙은 뒤 실행되는 useEffect에서 직접 scrollTop을 읽는다. */
export const useScrollProgress = ({
  scrollRef,
  threshold = 0,
}: UseScrollProgressProps) => {
  const scrollYProgress = useMotionValue(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;

      scrollYProgress.set(maxScroll > 0 ? container.scrollTop / maxScroll : 0);
      setIsScrolled(container.scrollTop > threshold);
    };

    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });

    // 요약 본문이 뒤늦게 채워지며 스크롤 높이가 바뀌므로 크기 변화도 함께 본다.
    const resizeObserver = new ResizeObserver(handleScroll);

    resizeObserver.observe(container);

    Array.from(container.children).forEach((child) =>
      resizeObserver.observe(child),
    );

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [scrollRef, scrollYProgress, threshold]);

  return { scrollYProgress, isScrolled };
};
