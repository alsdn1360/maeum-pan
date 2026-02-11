import './globals.css';

import KakaoScript from '@/app/sermon/[id]/_components/kakao-script';
import { maruburi } from '@/assets/fonts/fonts';
import { MotionProvider } from '@/components/providers/motion-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { APP_BASE_URL } from '@/constants/app-path';
import { METADATA_INFO } from '@/constants/metadata-info';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: METADATA_INFO.SITE_NAME,
  description: METADATA_INFO.SITE_DESCRIPTION,
  keywords: ['성경', '묵상', 'QT', '말씀암송', '기독교', '교회'],
  openGraph: {
    title: METADATA_INFO.SITE_NAME,
    description: METADATA_INFO.OPEN_GRAPH_DESCRIPTION,
    type: 'website',
    url: APP_BASE_URL,
    siteName: METADATA_INFO.SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: METADATA_INFO.SITE_NAME,
    description: METADATA_INFO.OPEN_GRAPH_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: METADATA_INFO.SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(0.99 0.004 94)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(0.19 0 0)' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
};

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
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
      <KakaoScript />
    </html>
  );
}
