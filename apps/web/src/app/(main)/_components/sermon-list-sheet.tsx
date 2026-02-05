'use client';

import { useSermonList } from '@/app/(main)/_hooks/use-sermon-list';
import { menuIcon } from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { SermonListItem } from './sermon-list-item';

export function SermonListSheet() {
  const sermonList = useSermonList();

  const sortedSermonList = [...sermonList].sort(
    (a, b) =>
      new Date(b.data.createdAt).getTime() -
      new Date(a.data.createdAt).getTime(),
  );

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground self-center text-xs">
            {menuIcon}
          </Button>
        }></SheetTrigger>
      <SheetContent side="left" showCloseButton={false}>
        <ScrollArea className="h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>새겨진 말씀</SheetTitle>
            <SheetDescription>
              저장된 설교는 브라우저에 보관되며, 방문 기록 삭제 시 초기화됩니다
            </SheetDescription>
          </SheetHeader>
          {sortedSermonList.length === 0 ? (
            <p className="text-muted-foreground px-6 text-sm">
              아직 새겨진 말씀이 없습니다
            </p>
          ) : (
            <ul className="px-6 pb-6">
              {sortedSermonList.map((sermon) => (
                <SermonListItem key={sermon.id} sermon={sermon} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
