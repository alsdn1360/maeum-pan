import localFont from 'next/font/local';

export const maruburi = localFont({
  src: [
    {
      path: './maruburi/MaruBuri-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './maruburi/MaruBuri-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-maruburi',
  display: 'swap',
});
