'use client';

import { AuthGuard } from '@/guards/AuthGuard';
import { MainLayout } from '@/layouts/MainLayout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
