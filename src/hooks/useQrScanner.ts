import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function useQrScanner(
  elementId: string,
  onResult: (text: string) => void
) {
  const [isOpen, setIsOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 15, aspectRatio: 1, disableFlip: false },
        (decodedText) => {
          onResult(decodedText);
          stop();
        },
        () => {}
      );
    } catch (err) {
      console.error('QR scanner failed to start:', err);
      scannerRef.current = null;
      setIsOpen(false);
    }
  }, [elementId, onResult]);

  const open = () => setIsOpen(true);

  const stop = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { open, stop, startScanner, isOpen };
}
