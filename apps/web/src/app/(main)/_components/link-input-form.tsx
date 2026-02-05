'use client';

import { sparklesIcon } from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

import { useSermonForm } from '../_hooks/use-sermon-form';
import { LinkInputStatusMsg } from './link-input-status-message';

export function LinkInputForm() {
  const { inputRef, handleSubmit, errorMessage, isPending } = useSermonForm();

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
          disabled={isPending}
          required
        />
        <Button type="submit" size="icon-lg" disabled={isPending}>
          {isPending ? <Spinner /> : sparklesIcon}
        </Button>
      </form>

      <LinkInputStatusMsg errorMessage={errorMessage} isPending={isPending} />
    </div>
  );
}
