'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { LockScreen } from '@/components/common/LockScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isInitialized = useStore((s) => s.isInitialized);
  const isLocked = useStore((s) => s.isLocked);

  useEffect(() => {
    if (!isInitialized) {
      router.replace('/onboarding');
    }
  }, [isInitialized, router]);

  if (!isInitialized) {
    return null;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return <>{children}</>;
}
