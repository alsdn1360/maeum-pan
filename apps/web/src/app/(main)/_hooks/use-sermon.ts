import { postSermon } from '@/api/post-sermon/post';
import useSWRMutation from 'swr/mutation';

const sendSermonRequest = (_: string, { arg }: { arg: string }) =>
  postSermon({ url: arg });

export const useSermon = () => {
  const { trigger, isMutating, data, error, reset } = useSWRMutation(
    'sermon-request',
    sendSermonRequest,
    {
      throwOnError: false,
    },
  );

  const getErrorMessage = () => {
    if (!error) return null;

    const msg = error.message;

    if (msg.includes('Request timed out') || msg.includes('3분 초과')) {
      return '요청 시간이 초과되었습니다. 영상 길이가 너무 길거나 네트워크 상태가 좋지 않습니다.';
    }

    return msg || '설교 영상을 가져오는데 실패했습니다';
  };

  return {
    requestSermon: trigger,
    isMutating,
    data,
    error: getErrorMessage(),
    reset,
  };
};
