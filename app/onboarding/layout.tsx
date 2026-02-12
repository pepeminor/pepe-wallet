'use client';

import { OnboardingGuard } from '@/guards/OnboardingGuard';
import { AuthLayout } from '@/layouts/AuthLayout';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <AuthLayout>{children}</AuthLayout>
    </OnboardingGuard>
  );
}
