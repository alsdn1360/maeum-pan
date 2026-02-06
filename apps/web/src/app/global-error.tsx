'use client';

import './globals.css';

import { maruburi } from '@/assets/fonts/fonts';
import {
  arrowLeftIcon,
  homeIcon,
  refreshIcon,
} from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_PATH } from '@/constants/app-path';
import { AccidentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SUPPORT_MAIL = 'kdw34441360@gmail.com';

const accidentIcon = (
  <HugeiconsIcon
    icon={AccidentIcon}
    className="text-destructive mx-auto size-16"
  />
);

interface GlobalErrorProps {
  error: Error & { digest?: string };
}

export default function GlobalError({ error }: GlobalErrorProps) {
  const router = useRouter();

  return (
    <html lang="ko" className={maruburi.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-screen w-screen flex-col items-center justify-center gap-6 p-5 font-serif antialiased">
        <div className="flex max-w-lg flex-col items-center justify-center gap-6">
          {accidentIcon}
          <div className="flex flex-col gap-2">
            <h1 className="text-center text-5xl font-bold">Ooops!</h1>
            <p className="text-center text-xl font-semibold">
              문제가 발생했습니다
            </p>
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              아래 버튼을 이용해 주세요.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                window.location.reload();
                router.refresh();
              }}>
              {refreshIcon}
              새로고침하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.back()}>
              {arrowLeftIcon}
              뒤로가기
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              render={<Link href={APP_PATH.MAIN} />}>
              {homeIcon}
              메인 페이지로 가기
            </Button>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-muted-foreground mx-auto text-center text-sm leading-relaxed">
              문제가 계속된다면, 아래의 이메일로 문의해 주세요. 빠르게 해결해
              드리겠습니다.
            </p>
            <Button
              variant="link"
              className="text-muted-foreground"
              render={<Link href={`mailto:${SUPPORT_MAIL}`} />}>
              {SUPPORT_MAIL}
            </Button>
          </div>
        </div>

        {/* Development only */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <Card className="bg-muted max-w-2/3 text-left">
            <CardContent>
              <p className="mb-2">Error Details:</p>
              <p className="text-muted-foreground bg-background/50 rounded-sm border p-2 font-mono text-sm wrap-break-word">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-muted-foreground mt-2 font-mono text-sm">
                  Error ID: {error.digest}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </body>
    </html>
  );
}
