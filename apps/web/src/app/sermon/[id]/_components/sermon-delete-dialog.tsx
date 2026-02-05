import { deleteIcon } from '@/components/common/icons/icons';
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { APP_PATH } from '@/constants/app-path';
import { useRouter } from 'next/navigation';

interface SermonDeleteDialogProps {
  videoId: string;
  isCapturing: boolean;
}

export function SermonDeleteDialog({
  videoId,
  isCapturing,
}: SermonDeleteDialogProps) {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size="responsive-icon"
            disabled={isCapturing}
          />
        }>
        {deleteIcon}
        <span className="hidden sm:block">비우기</span>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>말씀을 잠시 비워두시겠어요?</DialogTitle>
          <DialogDescription className="leading-relaxed">
            현재 보관함에서 말씀이 삭제됩니다. 언제든{' '}
            <strong>동일한 영상으로 다시 요청하면</strong> 저장된 말씀을 다시
            꺼내볼 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.removeItem(`sermon-${videoId}`);
              router.replace(APP_PATH.MAIN);
            }}>
            비우기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
