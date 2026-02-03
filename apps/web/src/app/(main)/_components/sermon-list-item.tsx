import { type SermonItem } from '@/app/(main)/_types/sermon';
import { APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import Link from 'next/link';

interface SermonListItemProps {
  sermon: SermonItem;
}

const extractTitle = (summary: string): string => {
  return summary.split('\n')[0]?.replace(/^#*\s*/, '') || '마음판에 새긴 설교';
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('ko-KR');
  } catch {
    return '날짜 미상';
  }
};

export const SermonListItem = ({ sermon }: SermonListItemProps) => {
  const { id, data } = sermon;

  const title = extractTitle(data.summary);
  const sermonPath = buildUrlWithParams({
    url: APP_PATH.SERMON,
    pathParams: { videoId: id },
  });

  return (
    <li>
      <Link
        href={sermonPath}
        className="text-muted-foreground hover:text-foreground flex items-center justify-between gap-2 py-2.5 transition-colors">
        <span className="line-clamp-1 max-w-36 truncate text-sm sm:max-w-56">
          {title}
        </span>
        <span className="text-muted-foreground text-xs">
          {data.createdAt ? formatDate(data.createdAt) : '날짜 미상'}
        </span>
      </Link>
    </li>
  );
};
