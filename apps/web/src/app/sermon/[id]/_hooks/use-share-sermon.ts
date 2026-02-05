import { useState } from 'react';

import { buildUrlWithParams } from '@/lib/build-url-with-params';

const YOUTUBE_THUMBNAIL_URL =
  'https://img.youtube.com/vi/{videoId}/maxresdefault.jpg';
const COPY_CLEAR_DELAY = 5 * 1000; // 5초

export const useShareSermon = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, COPY_CLEAR_DELAY);
  };

  const handleShareKakao = (
    videoId: string,
    sermonTitle: string,
    url: string,
  ) => {
    const { Kakao } = window;

    if (!Kakao || !Kakao.Share) {
      alert('카카오톡 공유 기능을 불러오지 못했습니다.');

      return;
    }

    const imageUrl = buildUrlWithParams({
      url: YOUTUBE_THUMBNAIL_URL,
      pathParams: { videoId },
    });

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '마음에 새긴 말씀을 나눕니다 💌',
        description: sermonTitle,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: '말씀 보러가기',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  };

  return { handleShareKakao, handleCopyUrl, isCopied };
};
