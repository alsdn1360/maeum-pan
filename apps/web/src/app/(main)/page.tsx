import { MainContent } from './_components/main-content';
import { MainFooter } from './_components/main-footer';
import { MainHeader } from './_components/main-header';

export default function MainPage() {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden">
      <MainHeader />
      <MainContent />
      <MainFooter />
    </main>
  );
}
