import { LinkInputForm } from './_components/link-input-form.client';
import { SermonList } from './_components/sermon-list.client';

const MainPage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-4">
      <div className="flex w-full flex-col items-center justify-center gap-8">
        <h1 className="text-2xl font-bold">마음판</h1>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col text-center leading-relaxed">
            <p>흘러가는 말씀을 마음에 새기세요</p>
            <p className="text-muted-foreground text-sm">
              유튜브 설교 영상의 링크를 입력하면,
              <br className="block sm:hidden" /> 다시 묵상할 수 있도록 정리해
              드립니다
            </p>
          </div>

          <LinkInputForm />

          <p className="text-muted-foreground text-center text-xs">
            자막이 없는 영상은 지원하지 않습니다
          </p>
        </div>
      </div>

      <div className="absolute right-0 bottom-4 left-0 flex justify-center px-4">
        <SermonList />
      </div>
    </main>
  );
};

export default MainPage;
