import { SermonListSheet } from './sermon-list-sheet';

export function MainHeader() {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-16 items-center p-4">
      <SermonListSheet />
    </header>
  );
}
