import { useState } from 'react';

import { fetchTranscript } from '@/api/main/get-sermon/fetch';
import { type TranscriptResponse } from '@/api/main/get-sermon/type';

export const useTranscript = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TranscriptResponse | null>(null);

  const requestTranscript = async (url: string) => {
    setIsLoading(true);
    setData(null);

    try {
      const responseData = await fetchTranscript({ url });

      setData(responseData);

      return responseData;
    } catch (err) {
      console.error('자막 요청 오류:', err);
      alert('자막을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { requestTranscript, isLoading, data };
};
