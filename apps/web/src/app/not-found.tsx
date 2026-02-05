'use client';

import { arrowLeftIcon } from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { SearchRemoveIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

const searchRemoveIcon = (
  <HugeiconsIcon icon={SearchRemoveIcon} className="mx-auto size-16" />
);

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-background flex min-h-screen w-screen flex-col items-center justify-center p-5">
      <div className="flex max-w-lg flex-col items-center justify-center gap-6">
        {searchRemoveIcon}
        <h1 className="text-center text-5xl font-bold">404</h1>
        <div className="flex flex-col gap-2 leading-relaxed">
          <span className="text-center text-xl font-semibold">
            페이지를 찾을 수 없습니다
          </span>
          <span className="text-muted-foreground text-center text-sm">
            요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
            <br />
            URL을 다시 확인하거나 아래 버튼을 이용해 주세요.
          </span>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.back()}>
          {arrowLeftIcon}
          뒤로가기
        </Button>
      </div>
    </div>
  );
}
