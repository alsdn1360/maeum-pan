import { useEffect, useState } from 'react';

interface UseScrollThresholdProps {
  threshold?: number;
}

export const useScrollThreshold = ({
  threshold = 0,
}: UseScrollThresholdProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isOverThreshold = window.scrollY > threshold;

      setIsScrolled(isOverThreshold);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isScrolled };
};
