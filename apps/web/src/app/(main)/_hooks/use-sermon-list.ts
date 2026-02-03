'use client';

import { useEffect, useState } from 'react';

import { type SermonCacheData } from '@/lib/sermon-cache';

import { type SermonItem } from '../_types/sermon';

const SERMON_KEY_PREFIX = 'sermon-';

export const useSermonList = () => {
  const [sermonList, setSermonList] = useState<SermonItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const items: SermonItem[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith(SERMON_KEY_PREFIX)) {
          const id = key.replace(SERMON_KEY_PREFIX, '');
          const json = localStorage.getItem(key);

          if (json) {
            try {
              const data = JSON.parse(json) as SermonCacheData;

              items.push({ id, data });
            } catch {}
          }
        }
      }

      items.sort(
        (a, b) =>
          new Date(b.data.savedAt).getTime() -
          new Date(a.data.savedAt).getTime(),
      );

      setSermonList(items);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return sermonList;
};
