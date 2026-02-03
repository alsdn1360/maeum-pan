'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

interface ScrollFadeResult {
  isScrolled: boolean;
  canScrollMore: boolean;
  handleScroll: () => void;
}

export const useScrollFade = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  deps: unknown[] = [],
): ScrollFadeResult => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);

  const handleScroll = useCallback(() => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;

      setIsScrolled(scrollTop > 0);
      setCanScrollMore(scrollTop + clientHeight < scrollHeight - 1);
    }
  }, [ref]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll, deps]);

  return { isScrolled, canScrollMore, handleScroll };
};
