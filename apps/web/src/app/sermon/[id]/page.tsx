import { SermonBody } from './_components/sermon-body.client';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const SermonPage = async ({ params }: Props) => {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 pt-16">
      <SermonBody id={id} />

      <footer className="mt-16 w-full pb-4 text-center">
        <p className="text-muted-foreground text-xs leading-relaxed">
          본 요약은 AI가 정리한 묵상 참고 자료입니다.
          <br />
          설교자의 의도와 미세한 차이가 있을 수 있으니,{' '}
          <br className="sm:hidden" />
          깊은 은혜를 위해 원본 설교를 함께 확인해주세요.
        </p>
      </footer>
    </main>
  );
};

export default SermonPage;
