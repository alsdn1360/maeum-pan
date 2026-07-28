import { ScrollLayout } from '@/components/common/scroll-layout';

import { MainContent } from './_components/main-content';
import { MainFooter } from './_components/main-footer';
import { MainHeader } from './_components/main-header';

export default function MainPage() {
  return (
    <ScrollLayout header={<MainHeader />}>
      <div className="flex min-h-full flex-col">
        <MainContent />
        <MainFooter />
      </div>
    </ScrollLayout>
  );
}
