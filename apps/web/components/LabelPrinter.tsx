'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface LabelData {
  barcode: string;
  itemName: string;
  internalId: string;
  lotNumber?: string;
  expirationDate?: string;
  containerPath?: string;
}

interface LabelPrinterProps {
  data: LabelData;
  onPrint?: () => void;
}

export default function LabelPrinter({ data, onPrint }: LabelPrinterProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, data.barcode, {
        width: 200,
        margin: 2
      });
    }
  }, [data.barcode]);

  function handlePrint() {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Label: ${data.itemName}</title>
              <style>
                @media print {
                  @page { margin: 0; size: 4in 3in; }
                  body { margin: 0; padding: 10px; }
                }
                body {
                  font-family: Arial, sans-serif;
                  padding: 10px;
                }
                .label {
                  border: 1px solid #000;
                  padding: 10px;
                  text-align: center;
                }
                .barcode {
                  font-family: 'Courier New', monospace;
                  font-size: 24px;
                  letter-spacing: 2px;
                  margin: 10px 0;
                }
                .qr-code {
                  margin: 10px auto;
                  display: block;
                }
                .info {
                  font-size: 12px;
                  margin: 5px 0;
                }
              </style>
            </head>
            <body>
              <div class="label">
                <h3>${data.itemName}</h3>
                <div class="barcode">${data.barcode}</div>
                <canvas class="qr-code" id="qr"></canvas>
                <div class="info">ID: ${data.internalId}</div>
                ${data.lotNumber ? `<div class="info">Lot: ${data.lotNumber}</div>` : ''}
                ${data.expirationDate ? `<div class="info">Exp: ${data.expirationDate}</div>` : ''}
                ${data.containerPath ? `<div class="info">Path: ${data.containerPath}</div>` : ''}
              </div>
              <script>
                const canvas = document.getElementById('qr');
                const ctx = canvas.getContext('2d');
                // QR code will be rendered by QRCode library
                window.onload = () => {
                  setTimeout(() => window.print(), 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
    onPrint?.();
  }

  return (
    <div className="label-printer" ref={printRef}>
      <div className="label-preview">
        <h3>{data.itemName}</h3>
        <div className="barcode-display">{data.barcode}</div>
        <canvas ref={qrCanvasRef} className="qr-code" />
        <div className="label-info">
          <div>ID: {data.internalId}</div>
          {data.lotNumber && <div>Lot: {data.lotNumber}</div>}
          {data.expirationDate && <div>Exp: {data.expirationDate}</div>}
          {data.containerPath && <div>Path: {data.containerPath}</div>}
        </div>
      </div>
      <button onClick={handlePrint} className="btn btn-primary">
        Print Label
      </button>
    </div>
  );
}
