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
              마음에 새긴 은혜를 이곳에 보관합니다.
              <br /> 방문 기록 정리 시 초기화됩니다.
            </SheetDescription>
          </SheetHeader>
          {sortedSermonList.length === 0 ? (
            <p className="text-muted-foreground px-6 text-sm">
              은혜로운 말씀으로 이곳을 채워보세요
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
