'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const isInitialized = useStore((s) => s.isInitialized);

  useEffect(() => {
    router.replace(isInitialized ? '/dashboard' : '/onboarding');
  }, [isInitialized, router]);

  return null;
}
