import { useState } from 'react';

import { postSermon } from '@/api/main/post-sermon/post';
import { type PostSermonResponse } from '@/api/main/post-sermon/type';

interface UseSermonResult {
  requestSermon: (url: string) => Promise<PostSermonResponse | null>;
  isLoading: boolean;
  data: PostSermonResponse | null;
  error: string | null;
  clearError: () => void;
}

export const useSermon = (): UseSermonResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PostSermonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const requestSermon = async (
    url: string,
  ): Promise<PostSermonResponse | null> => {
    setIsLoading(true);
    setData(null);
    setError(null);

    try {
      const responseData = await postSermon({ url });

      setData(responseData);

      return responseData;
    } catch (err) {
      console.error('설교 영상 요청 오류:', err);

      let errorMessage = '설교 영상을 가져오는데 실패했습니다';

      if (err instanceof Error) {
        if (
          err.message.includes('Request timed out') ||
          err.message.includes('3분 초과')
        ) {
          errorMessage =
            '요청 시간이 초과되었습니다. 영상 길이가 너무 길거나 네트워크 상태가 좋지 않습니다.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { requestSermon, isLoading, data, error, clearError };
};
