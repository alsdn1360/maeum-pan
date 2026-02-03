'use client';

import React, { useEffect, useRef, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { type SermonCacheData, setSermonCache } from '@/lib/sermon-cache';
import { SentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

import { useSermon } from '../_hooks/use-sermon';
import { LinkInputStatusMessage } from './link-input-status-message';

const ERROR_MESSAGES = {
  nonSermon: '목사님의 말씀이 담긴 영상만 요약할 수 있습니다',
} as const;

const ERROR_CLEAR_DELAY = 5000;

export const LinkInputForm = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTransitioning, startTransition] = useTransition();
  const [localError, setLocalError] = React.useState<string | null>(null);

  const {
    requestSermon,
    isLoading,
    error: hookError,
    clearError,
  } = useSermon();

  const isPending = isLoading || isTransitioning;
  const errorMessage = localError || hookError;

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setLocalError(null);
      clearError();
    }, ERROR_CLEAR_DELAY);

    return () => clearTimeout(timer);
  }, [errorMessage, clearError]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          setLocalError(null);
          clearError();

          if (isPending) return;

          const url = inputRef.current?.value?.trim();

          if (!url) return;

          const response = await requestSermon(url);

          if (!response?.videoId) return;

          if (response.isNonSermon) {
            setLocalError(ERROR_MESSAGES.nonSermon);

            return;
          }

          const sermonStorageData: SermonCacheData = {
            videoId: response.videoId,
            summary: response.summary,
            sermonDate: response.sermonDate,
            originalUrl: url,
            savedAt: new Date().toISOString(),
            isNonSermon: response.isNonSermon,
          };

          setSermonCache(response.videoId, sermonStorageData);

          startTransition(() => {
            localStorage.setItem(
              `sermon-${response.videoId}`,
              JSON.stringify(sermonStorageData),
            );

            const sermonPath = buildUrlWithParams({
              url: APP_PATH.SERMON,
              pathParams: { videoId: response.videoId },
            });

            router.push(sermonPath);
          });
        }}
        className="mx-auto flex w-full max-w-xl items-center gap-1.5">
        <Input
          ref={inputRef}
          type="url"
          placeholder="예시: https://www.youtube.com/watch?v=..."
          className="h-10"
          disabled={isPending}
          required
        />
        <Button type="submit" size="icon-lg" disabled={isPending}>
          {isPending ? <Spinner /> : <HugeiconsIcon icon={SentIcon} />}
        </Button>
      </form>

      <LinkInputStatusMessage
        errorMessage={errorMessage}
        isPending={isPending}
      />
    </div>
  );
};
