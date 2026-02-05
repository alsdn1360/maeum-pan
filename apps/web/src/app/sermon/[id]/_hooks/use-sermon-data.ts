import { useEffect, useLayoutEffect, useState } from 'react';

import { getSermon } from '@/api/get-sermon/get';
import {
  type SermonCacheData,
  setSermonCache,
  takeSermonCache,
} from '@/lib/sermon-cache';

interface UseSermonDataProps {
  videoId: string;
}

export const useSermonData = ({ videoId }: UseSermonDataProps) => {
  const [data, setData] = useState<SermonCacheData | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const sermonFromCache = takeSermonCache(videoId);

    if (sermonFromCache) {
      setData(sermonFromCache);
      setIsResolved(true);

      return;
    }

    const sermonFromStorage =
      typeof window !== 'undefined'
        ? localStorage.getItem(`sermon-${videoId}`)
        : null;

    if (sermonFromStorage) {
      try {
        setData(JSON.parse(sermonFromStorage));
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

        setSermonCache(response.videoId, sermonData);
        localStorage.setItem(
          `sermon-${response.videoId}`,
          JSON.stringify(sermonData),
        );

        setData(sermonData);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : '말씀을 불러오는 중에 문제가 발생했습니다',
        );
      } finally {
        setIsResolved(true);
      }
    };

    getSermonFromServer();
  }, [videoId, isResolved, data]);

  return { data, isResolved, error };
};
