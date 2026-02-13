import { useEffect, useRef } from 'react';
import { useStore } from '@/store';

const FIRST_REMINDER_MS = 30_000; // 30 seconds
const REPEAT_INTERVAL_MS = 10 * 60_000; // 10 minutes

export function useExportReminder() {
  const hasExportedKeys = useStore((s) => s.hasExportedKeys);
  const isInitialized = useStore((s) => s.isInitialized);
  const isLocked = useStore((s) => s.isLocked);
  const addToast = useStore((s) => s.addToast);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hasExportedKeys || !isInitialized || isLocked) return;

    const showReminder = () => {
      addToast({
        type: 'warning',
        message: 'Back up your keys! Go to Settings → Export Keys',
      });
    };

    timerRef.current = setTimeout(() => {
      showReminder();
      intervalRef.current = setInterval(showReminder, REPEAT_INTERVAL_MS);
    }, FIRST_REMINDER_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasExportedKeys, isInitialized, isLocked, addToast]);
}
