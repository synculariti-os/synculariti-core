import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { UnifiedSessionProvider } from '@/providers/unified-session';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Synculariti',
  description: 'Enterprise Management System',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/brand/identity.png', type: 'image/png' }],
    apple: [{ url: '/brand/identity.png' }],
    shortcut: '/brand/identity.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Synculariti',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Synculariti" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950">
        <UnifiedSessionProvider>
          {children}
        </UnifiedSessionProvider>
      </body>
    </html>
  );
}
