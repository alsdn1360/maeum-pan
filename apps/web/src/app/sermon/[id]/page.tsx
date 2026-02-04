import { SermonContent } from './_components/sermon-content';
import { SermonFooter } from './_components/sermon-footer';
import { SermonHeader } from './_components/sermon-header';

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

      <SermonContent videoId={id} />

      <SermonFooter />
    </main>
  );
};

export default SermonPage;
