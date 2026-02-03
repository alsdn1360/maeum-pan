export interface SermonCacheData {
  videoId: string;
  summary: string;
  sermonDate: string;
  originalUrl: string;
  savedAt: string;
  isNonSermon?: boolean;
}

const cache = new Map<string, SermonCacheData>();

export const setSermonCache = (id: string, data: SermonCacheData): void => {
  cache.set(id, data);
};

export const getSermonCache = (id: string): SermonCacheData | undefined => {
  return cache.get(id);
};

/** 한 번 읽은 뒤 제거 (새로고침 시 localStorage만 사용) */
export const takeSermonCache = (id: string): SermonCacheData | undefined => {
  const data = cache.get(id);

  if (data) {
    cache.delete(id);
  }

  return data;
};
