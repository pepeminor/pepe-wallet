import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function useQrScanner(
  elementId: string,
  onResult: (text: string) => void
) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const start = async () => {
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onResult(decodedText);
          stop();
        },
        () => {} // ignore errors during scanning
      );
      setIsScanning(true);
    } catch (err) {
      console.error('QR scanner failed to start:', err);
      scannerRef.current = null;
    }
  };

  const stop = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { start, stop, isScanning };
}
