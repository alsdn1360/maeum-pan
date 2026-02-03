'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { type SermonCacheData, setSermonCache } from '@/lib/sermon-cache';
import { SentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useSermon } from '../_hooks/use-sermon';

const sendIcon = <HugeiconsIcon icon={SentIcon} />;
const loadingIcon = <Spinner />;

const LOADING_MESSAGES = [
  '목사님의 말씀을 귀담아듣고 있습니다',
  '은혜로운 내용을 선별하고 있습니다',
  '마음판에 새길 준비를 하고 있습니다',
  '잠시만 기다려주세요',
];

const RotatingLoadingMessage = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.p
      key={LOADING_MESSAGES[msgIndex]}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      className="text-muted-foreground absolute inset-x-0 top-0 text-xs">
      {LOADING_MESSAGES[msgIndex]}
    </motion.p>
  );
};

export const LinkInputForm = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTransitioning, startTransition] = useTransition();

  const { requestSermon, isLoading } = useSermon();

  const isPending = isLoading || isTransitioning;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
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

          const response = await requestSermon(url);

          if (response) {
            const { videoId, summary, sermonDate } = response;

            if (!videoId) {
              return;
            }

            const sermonStorageData: SermonCacheData = {
              videoId,
              summary,
              sermonDate,
              originalUrl: url,
              savedAt: new Date().toISOString(),
            };

            setSermonCache(videoId, sermonStorageData);

            startTransition(() => {
              localStorage.setItem(
                `sermon-${videoId}`,
                JSON.stringify(sermonStorageData),
              );

              const sermonPath = buildUrlWithParams({
                url: APP_PATH.SERMON,
                pathParams: { videoId },
              });

              router.push(sermonPath);
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

      {/* 상태 메시지 영역 */}
      <div className="relative h-4 w-full text-center">
        <AnimatePresence mode="wait">
          {isPending ? (
            <RotatingLoadingMessage key="loading-msg" />
          ) : (
            <motion.p
              key="default-msg"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground absolute inset-x-0 top-0 text-xs">
              자막이 없는 영상은 지원하지 않습니다
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
