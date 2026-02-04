import { useEffect, useLayoutEffect, useState } from 'react';

import { getSermon } from '@/api/main/get-sermon/get';
import { type SermonCacheData, takeSermonCache } from '@/lib/sermon-cache';

interface UseSermonDataResult {
  data: SermonCacheData | null;
  isResolved: boolean;
  error: string | null;
}

export const useSermonData = (videoId: string): UseSermonDataResult => {
  const [data, setData] = useState<SermonCacheData | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const fromCache = takeSermonCache(videoId);

    if (fromCache) {
      setData(fromCache);
      setIsResolved(true);

      return;
    }

    const savedJson =
      typeof window !== 'undefined'
        ? localStorage.getItem(`sermon-${videoId}`)
        : null;

    if (savedJson) {
      try {
        setData(JSON.parse(savedJson));
        setIsResolved(true);
      } catch {
        /* empty */
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (isResolved || data) {
      return;
    }

    const getSermonFromServer = async () => {
      try {
        const response = await getSermon(videoId);

        const sermonData: SermonCacheData = {
          videoId: response.videoId,
          summary: response.summary,
          createdAt: response.createdAt,
          originalUrl: `https://www.youtube.com/watch?v=${response.videoId}`,
          savedAt: new Date().toISOString(),
          isNonSermon: response.isNonSermon,
        };

        localStorage.setItem(`sermon-${videoId}`, JSON.stringify(sermonData));
        setData(sermonData);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : '말씀을 불러오는데 실패했습니다.',
        );
      } finally {
        setIsResolved(true);
      }
    };

    getSermonFromServer();
  }, [videoId, isResolved, data]);

  return { data, isResolved, error };
};
