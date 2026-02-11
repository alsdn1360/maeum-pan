'use client';

import Script from 'next/script';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any;
  }
}

export default function KakaoScript() {
  const onLoad = () => {
    window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
  };

  return (
    <Script
      async
      src="https://developers.kakao.com/sdk/js/kakao.js"
      onLoad={onLoad}
      strategy="lazyOnload"
    />
  );
}
