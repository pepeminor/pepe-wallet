'use client';

import dynamic from 'next/dynamic';

const AppProviders = dynamic(
  () => import('@/providers/AppProviders').then((mod) => mod.AppProviders),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="app-container">
        {children}
      </div>
    </AppProviders>
  );
}
