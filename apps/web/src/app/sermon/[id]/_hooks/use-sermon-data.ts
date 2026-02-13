import { startTransition, useEffect, useState } from 'react';

import { getSermon } from '@/api/get-sermon/get';
import { readFromStorage, saveToStorage } from '@/lib/local-storage';
import { type SermonData } from '@/types/sermon';
import useSWR from 'swr';

interface UseSermonDataProps {
  videoId: string;
}

export const useSermonData = ({ videoId }: UseSermonDataProps) => {
  const [isStorageChecked, setIsStorageChecked] = useState(false);
  const [cachedData, setCachedData] = useState<SermonData | undefined>(
    undefined,
  );

  useEffect(() => {
    const stored = readFromStorage(videoId);

    if (stored) {
      startTransition(() => {
        setCachedData(stored);
      });
    }

    startTransition(() => {
      setIsStorageChecked(true);
    });
  }, [videoId]);

  const { data, isLoading, error } = useSWR(
    isStorageChecked && videoId ? ['sermon', videoId] : null,
    async () => {
      const response = await getSermon(videoId);

      const sermonData: SermonData = {
        videoId: response.videoId,
        summary: response.summary,
        createdAt: response.createdAt,
        originalUrl: response.originalUrl,
        savedAt: new Date().toISOString(),
        isNonSermon: response.isNonSermon,
      };

      saveToStorage(videoId, sermonData);

      return sermonData;
    },
    {
      fallbackData: cachedData,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    data,
    isLoading: !isStorageChecked || isLoading,
    error: error instanceof Error ? error.message : error ? '에러 발생' : null,
  };
};
