import localFont from 'next/font/local';

export const maruburi = localFont({
  src: [
    {
      path: './maruburi/MaruBuri-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './maruburi/MaruBuri-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-maruburi',
  display: 'swap',
});
