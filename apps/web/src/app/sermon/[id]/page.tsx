import { SermonContent } from './_components/sermon-content';
import { SermonFooter } from './_components/sermon-footer';
import { SermonHeader } from './_components/sermon-header';
import { SERMON_CAPTURE_AREA_ID } from './_constants/sermon-capture';

interface SermonPageProps {
  params: Promise<{
    id: string;
  }>;
}

const SermonPage = async ({ params }: SermonPageProps) => {
  const { id } = await params;

  return (
    <main className="flex min-h-screen w-full flex-col">
      <SermonHeader videoId={id} />

      <div id={SERMON_CAPTURE_AREA_ID} className="bg-background">
        <SermonContent videoId={id} />

        <SermonFooter />
      </div>
    </main>
  );
};

export default SermonPage;
