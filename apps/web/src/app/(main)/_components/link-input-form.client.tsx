'use client';

import { useRef, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { type SermonCacheData, setSermonCache } from '@/lib/sermon-cache';
import { SentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

import { useTranscript } from '../_hooks/useTranscript';

const sendIcon = <HugeiconsIcon icon={SentIcon} />;
const loadingIcon = <Spinner />;

export const LinkInputForm = () => {
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const { requestTranscript, isLoading } = useTranscript();

  const isPending = isLoading || isTransitioning;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        if (isPending) {
          return;
        }

        const url = inputRef.current?.value?.trim();

        if (!url) {
          return;
        }

        const response = await requestTranscript(url);

        if (response) {
          const { videoId, summary, sermonDate } = response;

          if (!videoId) {
            return;
          }

          const storageData: SermonCacheData = {
            videoId,
            summary,
            sermonDate,
            originalUrl: url,
            savedAt: new Date().toISOString(),
          };

          // 상세 페이지에서 즉시 표시할 수 있도록 캐시에 넣고 이동
          setSermonCache(videoId, storageData);
          startTransition(() => {
            localStorage.setItem(
              `sermon-${videoId}`,
              JSON.stringify(storageData),
            );
            router.push(`/sermon/${videoId}`);
          });
        }
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
        {isPending ? loadingIcon : sendIcon}
      </Button>
    </form>
  );
};
