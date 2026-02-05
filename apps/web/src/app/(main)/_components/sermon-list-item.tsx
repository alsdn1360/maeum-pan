import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { formatDate } from '@/lib/format-date';
import { type SermonData } from '@/types/sermon';
import Link from 'next/link';

interface SermonListItemProps {
  sermon: SermonData;
}

export function SermonListItem({ sermon }: SermonListItemProps) {
  const sermonTitle = extractSermonTitle({ summary: sermon.summary });
  const sermonUrl = buildUrlWithParams({
    url: APP_PATH.SERMON,
    pathParams: { videoId: sermon.videoId },
  });

  return (
    <li>
      <Link
        href={sermonUrl}
        className="text-muted-foreground hover:text-foreground flex items-center justify-between gap-3 py-2.5 transition-colors">
        <span className="line-clamp-1 truncate text-sm">{sermonTitle}</span>
        <span className="shrink-0 text-xs">
          {formatDate({ dateString: sermon.savedAt })}
        </span>
      </Link>
    </li>
  );
}
