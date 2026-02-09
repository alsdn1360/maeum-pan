import {
  copyIcon,
  kakaoIcon,
  shareIcon,
} from '@/components/common/icons/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useShareSermon } from '../_hooks/use-share-sermon';

const tickIcon = <HugeiconsIcon icon={Tick01Icon} className="text-success" />;

interface SermonShareDialogProps {
  videoId: string;
  sermonTitle: string;
  url: string;
}

export function SermonShareDialog({
  videoId,
  sermonTitle,
  url,
}: SermonShareDialogProps) {
  const { handleShareKakao, handleCopyUrl, isCopied } = useShareSermon();

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="responsive-icon" />}>
        {shareIcon}
        <span className="hidden sm:block">말씀 나누기</span>
      </DialogTrigger>
      <DialogContent initialFocus={false}>
        <DialogHeader>
          <DialogTitle>은혜로운 말씀을 나눠보세요</DialogTitle>
          <DialogDescription>
            링크를 복사하거나 카카오톡으로 바로 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <Input value={url} className="truncate" readOnly />
            <Button
              variant="outline"
              size="responsive-icon"
              onClick={() => handleCopyUrl(url)}
              className={cn(
                isCopied
                  ? 'bg-success/10 border-success/30 hover:bg-success/20'
                  : '',
              )}>
              {isCopied ? tickIcon : copyIcon}
              <span
                className={cn(
                  'hidden sm:block',
                  isCopied ? 'text-success' : '',
                )}>
                {isCopied ? '완료' : '복사'}
              </span>
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => handleShareKakao(videoId, sermonTitle, url)}
            className="w-full">
            {kakaoIcon}
            <span>카카오톡으로 공유하기</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
