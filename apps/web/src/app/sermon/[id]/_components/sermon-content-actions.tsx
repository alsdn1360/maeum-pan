import { formatDate } from '@/lib/format-date';
import Link from 'next/link';

import { SermonDeleteDialog } from './sermon-delete-dialog';

interface SermonContentActionsProps {
  originalUrl: string;
  createdAt: string;
  videoId: string;
}

export const SermonContentActions = ({
  originalUrl,
  createdAt,
  videoId,
}: SermonContentActionsProps) => {
  return (
    <div className="flex w-full flex-col items-end justify-between gap-8">
      <div className="flex flex-col items-end gap-1">
        <Link
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground ml-4 line-clamp-1 text-sm break-all transition-colors">
          {originalUrl}
        </Link>
        <p className="text-muted-foreground text-sm">
          마음에 담은 날: {formatDate({ dateString: createdAt })}
        </p>
      </div>

      <SermonDeleteDialog videoId={videoId} />
    </div>
  );
};
