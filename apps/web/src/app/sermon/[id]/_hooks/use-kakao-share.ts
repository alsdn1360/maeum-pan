import { APP_BASE_URL, APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';

const YOUTUBE_THUMBNAIL_URL =
  'https://img.youtube.com/vi/{videoId}/maxresdefault.jpg';

export const useKakaoShare = () => {
  const handleShareSermon = (videoId: string, sermonTitle: string) => {
    const { Kakao } = window;

    if (!Kakao || !Kakao.Share) {
      alert('카카오톡 공유 기능을 불러오지 못했습니다.');

      return;
    }

    const url = buildUrlWithParams({
      url: APP_BASE_URL + APP_PATH.SERMON,
      pathParams: { videoId },
    });
    const imageUrl = buildUrlWithParams({
      url: YOUTUBE_THUMBNAIL_URL,
      pathParams: { videoId },
    });

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '마음에 새긴 은혜를 나눕니다 💌',
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

  return { handleShareSermon };
};
