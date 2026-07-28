import { ScrollLayout } from '@/components/common/scroll-layout';

import KakaoScript from './_components/kakao-script';
import { SermonContent } from './_components/sermon-content';
import { SermonFooter } from './_components/sermon-footer';
import { SermonHeader } from './_components/sermon-header';
import { SERMON_CAPTURE_AREA_ID } from './_constants/sermon-capture';

interface SermonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SermonPage({ params }: SermonPageProps) {
  const { id } = await params;

  return (
    <ScrollLayout header={<SermonHeader videoId={id} />}>
      <div
        id={SERMON_CAPTURE_AREA_ID}
        className="bg-background mx-auto flex w-full max-w-prose flex-col px-4 pt-5 pb-4 sm:px-0">
        <SermonContent videoId={id} />
        <SermonFooter />
      </div>
      <KakaoScript />
    </ScrollLayout>
  );
}
