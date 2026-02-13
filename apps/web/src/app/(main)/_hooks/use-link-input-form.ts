import { type SubmitEvent, useEffect, useRef, useTransition } from 'react';

import { postSermon } from '@/api/post-sermon/post';
import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { saveToStorage } from '@/lib/local-storage';
import { type SermonData } from '@/types/sermon';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

const ERROR_MSGS = {
  NON_SERMON: '목사님의 말씀이 담긴 영상만 요약할 수 있습니다',
  TIMEOUT:
    '요청 시간이 초과되었습니다. 영상 길이가 너무 길거나 네트워크 상태가 좋지 않습니다.',
  DEFAULT: '설교 영상을 가져오는데 실패했습니다',
} as const;
const ERROR_CLEAR_DELAY = 10 * 60 * 1000; // 10분

const generateSermonFetcher = async (
  _: string,
  { arg: url }: { arg: string },
) => {
  const response = await postSermon({ url });

  if (response.isNonSermon) {
    throw new Error(ERROR_MSGS.NON_SERMON);
  }

  return response;
};

export const useLinkInputForm = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTransitioning, startTransition] = useTransition();
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error, reset } = useSWRMutation(
    'sermon-request',
    generateSermonFetcher,
    {
      throwOnError: false,
      onSuccess: (response) => {
        const sermonData: SermonData = {
          videoId: response.videoId,
          summary: response.summary,
          createdAt: response.createdAt,
          originalUrl: response.originalUrl,
          savedAt: new Date().toISOString(),
          isNonSermon: false,
        };

        mutate(['sermon', response.videoId], sermonData, false);

        saveToStorage(response.videoId, sermonData);

        startTransition(() => {
          const sermonPath = buildUrlWithParams({
            url: APP_PATH.SERMON,
            pathParams: { videoId: response.videoId },
          });

          router.push(sermonPath);
        });
      },
    },
  );

  const errorMsg = error
    ? (() => {
        const msg = error.message;

        if (msg.includes('Request timed out') || msg.includes('3분 초과')) {
          return ERROR_MSGS.TIMEOUT;
        }

        return msg || ERROR_MSGS.DEFAULT;
      })()
    : null;

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => reset(), ERROR_CLEAR_DELAY);

    return () => clearTimeout(timer);
  }, [errorMsg, reset]);

  const isLoading = isMutating || isTransitioning;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    const url = inputRef.current?.value?.trim();

    if (!url) return;

    reset();
    trigger(url);
  };

  return {
    inputRef,
    handleSubmit,
    errorMsg,
    isLoading,
  };
};
