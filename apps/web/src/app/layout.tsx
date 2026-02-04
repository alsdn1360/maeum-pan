import './globals.css';

import { ThemeProvider } from '@/components/providers/theme-provider';
import KakaoScript from '@/lib/kakao-script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Gowun_Batang } from 'next/font/google';

const siteDescription = '설교의 은혜를 깊이 있게 기록하다';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  ),
  title: '마음판',
  description: siteDescription,
  openGraph: {
    title: '마음판',
    description: siteDescription,
    type: 'website',
    url: 'http://localhost:3000',
    siteName: '마음판',
  },
  twitter: {
    card: 'summary_large_image',
    title: '마음판',
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(0.99 0.004 94)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(0.145 0 0)' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const gowunBatang = Gowun_Batang({
  variable: '--font-gowun-batang',
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko" className={gowunBatang.variable} suppressHydrationWarning>
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
};

export default RootLayout;
