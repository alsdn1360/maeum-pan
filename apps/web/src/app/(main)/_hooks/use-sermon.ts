import { useState } from 'react';

import { fetchSermon } from '@/api/main/fetch-sermon/fetch';
import { type FetchSermonResponse } from '@/api/main/fetch-sermon/type';

export const useSermon = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FetchSermonResponse | null>(null);

  const requestSermon = async (url: string) => {
    setIsLoading(true);
    setData(null);

    try {
      const responseData = await fetchSermon({ url });

      setData(responseData);

      return responseData;
    } catch (err) {
      console.error('설교 영상 요청 오류:', err);
      alert('설교 영상을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { requestSermon, isLoading, data };
};
