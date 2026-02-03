import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const infoIcon = <HugeiconsIcon icon={AlertCircleIcon} className="size-3" />;

export const SermonListTitleDialog = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={<button className="cursor-pointer self-start" type="button" />}>
        <div className="text-muted-foreground flex items-center gap-1">
          <p className="text-xs">새겨진 말씀</p>
          {infoIcon}
        </div>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>새겨진 말씀</DialogTitle>
          <DialogDescription>
            저장된 설교는 브라우저에 보관되며, 방문 기록 삭제 시 초기화됩니다
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
