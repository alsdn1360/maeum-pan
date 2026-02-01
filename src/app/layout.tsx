import './globals.css';

import { ThemeProvider } from '@/components/providers/theme-provider';
import type { Metadata } from 'next';
import { Gowun_Batang } from 'next/font/google';

const gowunBatang = Gowun_Batang({
  variable: '--font-gowun-batang',
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '마음판',
  description: '설교의 은혜를 깊이 있게 기록하다',
};

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
      </body>
    </html>
  );
};

export default RootLayout;
