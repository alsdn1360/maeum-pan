import { useEffect, useState } from 'react';

import { LOADING_MSGS } from '../_constants/loading-msg';

const ROTATION_INTERVAL = 2500;

export const useRotatingLoadingMsg = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MSGS.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { msgIndex };
};
