import { useState } from 'react';

import { fetchSermon } from '@/api/main/fetch-sermon/fetch';
import { type FetchSermonResponse } from '@/api/main/fetch-sermon/type';

interface UseSermonResult {
  requestSermon: (url: string) => Promise<FetchSermonResponse | null>;
  isLoading: boolean;
  data: FetchSermonResponse | null;
  error: string | null;
  clearError: () => void;
}

export const useSermon = (): UseSermonResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FetchSermonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const requestSermon = async (
    url: string,
  ): Promise<FetchSermonResponse | null> => {
    setIsLoading(true);
    setData(null);
    setError(null);

    try {
      const responseData = await fetchSermon({ url });

      setData(responseData);

      return responseData;
    } catch (err) {
      console.error('설교 영상 요청 오류:', err);
      setError('설교 영상을 가져오는데 실패했습니다');

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { requestSermon, isLoading, data, error, clearError };
};
