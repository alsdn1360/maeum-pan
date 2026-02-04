import { API_URL } from '@/api/api-url';
import { api } from '@/lib/api-client';
import { buildUrlWithParams } from '@/lib/build-url-with-params';

import { type GetSermonResponse } from './type';

export const getSermon = async (videoId: string) => {
  const url = buildUrlWithParams({
    url: API_URL.SERMON.GET,
    pathParams: { videoId },
  });

  return api.get<GetSermonResponse>(url);
};
