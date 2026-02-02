import { SermonBody } from './_components/sermon-body.client';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const SermonPage = async ({ params }: Props) => {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16">
      <SermonBody id={id} />
    </main>
  );
};

export default SermonPage;
