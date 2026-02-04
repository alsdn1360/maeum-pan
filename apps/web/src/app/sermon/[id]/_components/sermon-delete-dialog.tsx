import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { APP_PATH } from '@/constants/app-path';
import { useRouter } from 'next/navigation';

interface SermonDeleteDialogProps {
  videoId: string;
}

export const SermonDeleteDialog = ({ videoId }: SermonDeleteDialogProps) => {
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        마음판에서 비우기
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>말씀을 잠시 비워두시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            현재 보관함에서 말씀이 삭제됩니다. 언제든{' '}
            <strong>동일한 영상으로 다시 요청하면</strong> 저장된 말씀을 다시
            꺼내볼 수 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.removeItem(`sermon-${videoId}`);
              router.replace(APP_PATH.MAIN);
            }}>
            비우기
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
