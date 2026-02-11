import { LinkInputForm } from './link-input-form';
import { MainContentDescrition } from './main-content-descrition';
import { MainContentTitle } from './main-content-title';

export function MainContent() {
  return (
    <div className="-mt-16 flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <MainContentTitle />
      <div className="flex w-full flex-col gap-4">
        <MainContentDescrition />
        <LinkInputForm />
      </div>
    </div>
  );
}
