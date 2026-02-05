import { formatDate } from '@/lib/format-date';
import Link from 'next/link';

interface SermonContentActionsProps {
  originalUrl: string;
  savedAt: string;
}

export function SermonContentActions({
  originalUrl,
  savedAt,
}: SermonContentActionsProps) {
  return (
    <div className="flex w-full flex-col items-start justify-between gap-8">
      <div className="flex flex-col items-start gap-1">
        <Link
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground line-clamp-1 text-sm break-all transition-colors">
          설교 원본: {originalUrl}
        </Link>
        <p className="text-muted-foreground text-sm">
          마음에 담은 날: {formatDate({ dateString: savedAt })}
        </p>
      </div>
    </div>
  );
}
