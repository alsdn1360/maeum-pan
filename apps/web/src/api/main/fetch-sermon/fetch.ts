import { API_URL } from '@/api/api-url';
import { api } from '@/lib/api-client';

import { type FetchSermonRequest, type FetchSermonResponse } from './type';

export const fetchSermon = async (req: FetchSermonRequest) => {
  return api.post<FetchSermonResponse>(API_URL.SERMON, {
    url: req.url,
    languages: req.languages ?? ['ko', 'en'],
  });
};
