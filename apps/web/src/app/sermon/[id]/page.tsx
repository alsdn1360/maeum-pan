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
    <main className="flex min-h-screen w-full flex-col">
      <SermonHeader videoId={id} />
      <div
        id={SERMON_CAPTURE_AREA_ID}
        className="bg-background mx-auto flex w-full max-w-prose flex-1 flex-col px-4 pt-5 pb-4 sm:px-0 sm:pt-5 sm:pb-4">
        <SermonContent videoId={id} />
        <SermonFooter />
      </div>
      <KakaoScript />
    </main>
  );
}
