'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isInitialized = useStore((s) => s.isInitialized);

  useEffect(() => {
    if (isInitialized) {
      router.replace('/dashboard');
    }
  }, [isInitialized, router]);

  if (isInitialized) {
    return null;
  }

  return <>{children}</>;
}
