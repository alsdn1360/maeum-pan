import { useState } from 'react';

const TRANSCRIPT_API = 'http://127.0.0.1:8000';

export interface TranscriptResponse {
  summary: string;
  sermon_date: string; // YYYY-MM-DD
}

export const useTranscript = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TranscriptResponse | null>(null);

  const requestTranscript = async (url: string) => {
    setIsLoading(true);
    setData(null);

    try {
      const res = await fetch(`${TRANSCRIPT_API}/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, languages: ['ko', 'en'] }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.detail || '자막 요청 실패');
      }

      setData(responseData);
      console.log('자막 응답:', responseData);

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
