'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isInitialized = useStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      router.replace('/onboarding');
    }
  }, [isInitialized, router]);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
