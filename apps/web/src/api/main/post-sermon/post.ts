import { API_URL } from '@/api/api-url';
import { api } from '@/lib/api-client';

import { type PostSermonRequest, type PostSermonResponse } from './type';

export const postSermon = async (req: PostSermonRequest) => {
  return api.post<PostSermonResponse>(API_URL.SERMON.CREATE, {
    url: req.url,
    languages: req.languages ?? ['ko', 'en'],
  });
};
