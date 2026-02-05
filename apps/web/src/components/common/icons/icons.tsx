import {
  ArrowLeft02Icon,
  Copy01Icon,
  Delete02Icon,
  Home07Icon,
  ImageDownload02Icon,
  Menu01Icon,
  RefreshIcon,
  Share01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';

import KakaoLogo from '@/assets/logo/kakaotalk-logo.png';

export const arrowLeftIcon = <HugeiconsIcon icon={ArrowLeft02Icon} />;

export const refreshIcon = <HugeiconsIcon icon={RefreshIcon} />;

export const homeIcon = <HugeiconsIcon icon={Home07Icon} />;

export const menuIcon = <HugeiconsIcon icon={Menu01Icon} />;

export const sparklesIcon = <HugeiconsIcon icon={SparklesIcon} />;

export const imageDownloadIcon = <HugeiconsIcon icon={ImageDownload02Icon} />;

export const shareIcon = <HugeiconsIcon icon={Share01Icon} />;

export const deleteIcon = <HugeiconsIcon icon={Delete02Icon} />;

export const copyIcon = <HugeiconsIcon icon={Copy01Icon} />;

export const kakaoIcon = (
  <span className="size-6">
    <Image
      src={KakaoLogo}
      alt="카카오톡"
      className="size-full rounded-md object-cover"
      width={24}
      height={24}
    />
  </span>
);
