'use client';

import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isScanning) return;

    // Use browser's BarcodeDetector API if available
    if ('BarcodeDetector' in window) {
      startNativeBarcodeDetection();
    } else {
      // Fallback: Use html5-qrcode or @zxing/library
      startFallbackBarcodeDetection();
    }

    return () => {
      stopScanning();
    };
  }, [isScanning]);

  async function startNativeBarcodeDetection() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const detector = new (window as any).BarcodeDetector({
        formats: ['code_128', 'qr_code', 'ean_13']
      });

      const detectLoop = async () => {
        if (!videoRef.current || !isScanning) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            onScan(barcode);
            stopScanning();
          }
        } catch (err) {
          // Continue detection loop
        }

        if (isScanning) {
          requestAnimationFrame(detectLoop);
        }
      };

      detectLoop();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
    }
  }

  async function startFallbackBarcodeDetection() {
    // Fallback implementation using html5-qrcode
    // This would require installing: npm install html5-qrcode
    setError('BarcodeDetector API not available. Install html5-qrcode for fallback.');
  }

  function stopScanning() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }

  return (
    <div className="barcode-scanner">
      <div className="scanner-container">
        <video
          ref={videoRef}
          className="scanner-video"
          playsInline
          muted
        />
        {error && (
          <div className="error-message">{error}</div>
        )}
      </div>
      <div className="scanner-controls">
        {!isScanning ? (
          <button
            onClick={() => setIsScanning(true)}
            className="btn btn-primary"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="btn btn-secondary"
          >
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
}
