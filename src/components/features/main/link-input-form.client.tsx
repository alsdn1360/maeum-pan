'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export const LinkInputForm = () => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log('폼 제출됨');
      }}
      className="flex items-center gap-2">
      <Input
        type="url"
        placeholder="예시: https://www.youtube.com/watch?v=..."
        className="h-10"
        required
      />
      <Button type="submit" size="icon-lg">
        <HugeiconsIcon icon={SentIcon} />
      </Button>
    </form>
  );
};
