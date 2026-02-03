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
        마음판에서 지우기
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>마음판에서 지우시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            선택하신 설교 요약이 영구적으로 삭제됩니다. 삭제된 말씀은 다시
            복구할 수 없습니다.
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
            지우기
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
