import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { ImportStatusBadge } from '@/components/admin/import-status-badge';
import { AuthBootstrap } from '@/providers/auth-bootstrap';
import { ThemeBootstrap } from '@/providers/theme-bootstrap';
import { DeviceBootstrap } from '@/providers/device-bootstrap';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Paixão Music',
  description: 'Sua biblioteca pessoal de videoclipes — em vídeo ou apenas áudio.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1116',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <QueryProvider>
          <AuthBootstrap />
          <ThemeBootstrap />
          <DeviceBootstrap />
          {children}
          <ImportStatusBadge />
        </QueryProvider>
      </body>
    </html>
  );
}
