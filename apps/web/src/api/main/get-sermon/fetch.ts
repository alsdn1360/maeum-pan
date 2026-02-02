import { api } from '@/lib/api-client';

import { type TranscriptRequest, type TranscriptResponse } from './type';

export const fetchTranscript = async (req: TranscriptRequest) => {
  return api.post<TranscriptResponse>('/transcript', {
    url: req.url,
    languages: req.languages ?? ['ko', 'en'],
  });
};
