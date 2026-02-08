import { useState } from 'react';

import { showToast } from '@/lib/show-toast';
import { toPng } from 'html-to-image';

import { SERMON_CAPTURE_AREA_ID } from '../_constants/sermon-capture';

const PADDING_X = 16;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 4;

export const useCaptureSermon = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCaptureSermonCard = async (title: string) => {
    const element = document.getElementById(SERMON_CAPTURE_AREA_ID);

    if (!element) {
      showToast({ message: '담을 말씀을 찾을 수 없습니다', type: 'error' });

      return;
    }

    setIsCapturing(true);

    try {
      await document.fonts.ready;

      const currentBgColor = window.getComputedStyle(element).backgroundColor;
      const width = element.scrollWidth + PADDING_X * 2;
      const height = element.scrollHeight + PADDING_TOP + PADDING_BOTTOM;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        width,
        height,
        pixelRatio: 2,
        style: {
          backgroundColor: currentBgColor,
          padding: `${PADDING_TOP}px ${PADDING_X}px ${PADDING_BOTTOM}px ${PADDING_X}px`,
          margin: '0',
          width: '100%',
          height: 'auto',
          maxWidth: 'none',
          transform: 'none',
          WebkitFontSmoothing: 'antialiased',
          fontSmooth: 'antialiased',
        } as Partial<CSSStyleDeclaration>,
      });

      const link = document.createElement('a');

      link.download = `마음판-말씀 카드-${title}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      showToast({
        message: '말씀 카드에 말씀을 담는 중에 문제가 발생했습니다',
        type: 'error',
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return { isCapturing, handleCaptureSermonCard };
};
