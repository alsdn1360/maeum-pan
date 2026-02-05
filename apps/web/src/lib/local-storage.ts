import { type Sermon, type SermonData } from '@/types/sermon';

const SERMON_KEY_PREFIX = 'sermon-';

const getStorageKey = (videoId: string) => `${SERMON_KEY_PREFIX}${videoId}`;

export const saveToStorage = (videoId: string, data: SermonData) => {
  try {
    localStorage.setItem(getStorageKey(videoId), JSON.stringify(data));
  } catch {}
};

export const readFromStorage = (videoId: string) => {
  if (typeof window === 'undefined') return undefined;

  try {
    const stored = localStorage.getItem(getStorageKey(videoId));

    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
};

export const getSavedSermonList = (): Sermon[] => {
  if (typeof window === 'undefined') return [];

  const items: Sermon[] = [];

  try {
    const length = localStorage.length; // 접근 비용 최소화

    for (let i = 0; i < length; i++) {
      const key = localStorage.key(i);

      if (key?.startsWith(SERMON_KEY_PREFIX)) {
        const id = key.replace(SERMON_KEY_PREFIX, '');
        const json = localStorage.getItem(key);

        if (json) {
          try {
            const data = JSON.parse(json) as SermonData;

            items.push({ id, data });
          } catch {
            // 파싱 에러난 데이터는 무시 (Corrupted Data)
          }
        }
      }
    }

    // 최신순 정렬 (Date 객체 변환 오버헤드를 줄이기 위해 getTime() 바로 비교)
    return items.sort((a, b) => {
      const dateA = new Date(a.data.savedAt).getTime();
      const dateB = new Date(b.data.savedAt).getTime();

      return dateB - dateA;
    });
  } catch {
    // 스토리지 접근 차단 등의 에러 시 빈 배열 반환
    return [];
  }
};
