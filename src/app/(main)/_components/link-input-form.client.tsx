'use client';

import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { SentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useTranscript } from '../_hooks/useTranscript';

const sendIcon = <HugeiconsIcon icon={SentIcon} />;
const loadingIcon = <Spinner />;

export const LinkInputForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { requestTranscript, isLoading } = useTranscript();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        if (isLoading) {
          return;
        }

        const url = inputRef.current?.value?.trim();

        if (!url) {
          return;
        }

        await requestTranscript(url);
      }}
      className="mx-auto flex w-full max-w-xl items-center gap-1.5">
      <Input
        ref={inputRef}
        type="url"
        placeholder="예시: https://www.youtube.com/watch?v=..."
        className="h-10"
        disabled={isLoading}
        required
      />
      <Button type="submit" size="icon-lg" disabled={isLoading}>
        {isLoading ? loadingIcon : sendIcon}
      </Button>
    </form>
  );
};
