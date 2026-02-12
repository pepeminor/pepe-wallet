import type { Metadata, Viewport } from 'next';
import { ClientProviders } from '@/providers/ClientProviders';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Pepe Bag',
  description: 'Gateway to Web3',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d1117',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
