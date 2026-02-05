import {
  type SubmitEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { type SermonCacheData, setSermonCache } from '@/lib/sermon-cache';
import { useRouter } from 'next/navigation';

import { useSermon } from './use-sermon';

const ERROR_MSGS = {
  nonSermon: '목사님의 말씀이 담긴 영상만 요약할 수 있습니다',
} as const;
const ERROR_CLEAR_DELAY = 5000;

export const useLinkInputForm = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTransitioning, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const { requestSermon, isMutating, error, reset } = useSermon();

  const isLoading = isMutating || isTransitioning;
  const errorMessage = localError || error;

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setLocalError(null);
      reset();
    }, ERROR_CLEAR_DELAY);

    return () => clearTimeout(timer);
  }, [errorMessage, reset]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    reset();

    if (isLoading) return;

    const url = inputRef.current?.value?.trim();

    if (!url) return;

    const response = await requestSermon(url);

    if (!response?.videoId) return;

    if (response.isNonSermon) {
      setLocalError(ERROR_MSGS.nonSermon);

      return;
    }

    const sermonData: SermonCacheData = {
      videoId: response.videoId,
      summary: response.summary,
      createdAt: response.createdAt,
      originalUrl: url,
      savedAt: new Date().toISOString(),
      isNonSermon: response.isNonSermon,
    };

    setSermonCache(response.videoId, sermonData);
    localStorage.setItem(
      `sermon-${response.videoId}`,
      JSON.stringify(sermonData),
    );

    startTransition(() => {
      const sermonPath = buildUrlWithParams({
        url: APP_PATH.SERMON,
        pathParams: { videoId: response.videoId },
      });

      router.push(sermonPath);
    });
  };

  return {
    inputRef,
    handleSubmit,
    errorMessage,
    isPending: isLoading,
  };
};
