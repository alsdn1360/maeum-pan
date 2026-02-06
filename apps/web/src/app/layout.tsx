import './globals.css';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { APP_BASE_URL } from '@/constants/app-path';
import KakaoScript from '@/lib/kakao-script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

const SITE_DESCRIPTION = '흘러가는 말씀을 붙잡아, 인자와 진리를 마음에 새기다';

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: '마음판',
  description: SITE_DESCRIPTION,
  openGraph: {
    title: '마음판',
    description: SITE_DESCRIPTION,
    type: 'website',
    url: APP_BASE_URL,
    siteName: '마음판',
  },
  twitter: {
    card: 'summary_large_image',
    title: '마음판',
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '마음판',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(0.99 0.004 94)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(0.19 0 0)' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const maruburi = localFont({
  src: [
    {
      path: '../assets/fonts/maruburi/MaruBuri-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/maruburi/MaruBuri-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-maruburi',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={maruburi.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground font-serif antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
      <KakaoScript />
    </html>
  );
}
