'use client';

import { sparklesIcon } from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

import { useLinkInputForm } from '../_hooks/use-link-input-form';
import { LinkInputStatusMsg } from './link-input-status-msg';

export function LinkInputForm() {
  const { inputRef, handleSubmit, errorMsg, isLoading } = useLinkInputForm();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-xl items-center gap-1.5">
        <Input
          id="sermon-youtube-url"
          aria-describedby="sermon-youtube-url-description"
          ref={inputRef}
          type="url"
          placeholder="예시: https://www.youtube.com/watch?v=..."
          className="h-10"
          disabled={isLoading}
          autoComplete="off"
          required
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={isLoading}
          aria-label="설교 요약하기">
          {isLoading ? <Spinner /> : sparklesIcon}
        </Button>
      </form>

      <LinkInputStatusMsg errorMsg={errorMsg} isLoading={isLoading} />
    </div>
  );
}
