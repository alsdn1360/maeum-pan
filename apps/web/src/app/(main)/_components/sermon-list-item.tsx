import { type SermonItem } from '@/app/(main)/_types/sermon';
import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { formatDate } from '@/lib/format-date';
import Link from 'next/link';

interface SermonListItemProps {
  sermon: SermonItem;
}

export function SermonListItem({ sermon }: SermonListItemProps) {
  const { id, data } = sermon;

  const title = extractSermonTitle({ summary: data.summary });
  const sermonPath = buildUrlWithParams({
    url: APP_PATH.SERMON,
    pathParams: { videoId: id },
  });

  return (
    <li>
      <Link
        href={sermonPath}
        className="text-muted-foreground hover:text-foreground flex items-center justify-between gap-3 py-2.5 transition-colors">
        <span className="line-clamp-1 truncate text-sm">{title}</span>
        <span className="text-muted-foreground shrink-0 text-xs">
          {formatDate({ dateString: data.createdAt })}
        </span>
      </Link>
    </li>
  );
}
