'use client';

import { useEffect, useState, useTransition } from 'react';

import { getSavedSermonList } from '@/lib/local-storage';
import { type Sermon } from '@/types/sermon';

export const useSermonList = () => {
  const [sermonList, setSermonList] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const list = getSavedSermonList();

    startTransition(() => {
      setSermonList(list);
      setIsLoading(false);
    });
  }, []);

  return {
    sermonList,
    isLoading: isLoading || isPending,
  };
};
