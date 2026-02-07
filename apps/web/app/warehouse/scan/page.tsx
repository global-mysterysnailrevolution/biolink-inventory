'use client';

import { useState, useEffect } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import LabelPrinter from '@/components/LabelPrinter';

interface Unit {
  id: string;
  barcode: string;
  item_name: string;
  category: string;
  location: string;
  status: string;
  contains: any[];
  contained_in: any[];
}

export default function ScanPage() {
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleScan(barcode: string) {
    setScannedBarcode(barcode);
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/units/${barcode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Unit not found');
      }

      const data = await response.json();
      setUnit(data);
    } catch (err) {
      setError('Unit not found');
      setUnit(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleMove(newLocation: string) {
    if (!unit) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/units/${unit.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location: newLocation })
      });

      if (!response.ok) throw new Error('Move failed');

      // Refresh unit data
      handleScan(unit.barcode);
    } catch (err) {
      alert('Error moving unit');
    }
  }

  async function handleCheckout(orgId: string, programId: string, donationValue: number) {
    if (!unit) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/units/${unit.id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orgId,
          programId,
          donationValue
        })
      });

      if (!response.ok) throw new Error('Checkout failed');

      alert('Unit checked out successfully');
      setUnit(null);
      setScannedBarcode('');
    } catch (err) {
      alert('Error checking out unit');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Scan Unit</h1>

      <div className="mb-4">
        <BarcodeScanner onScan={handleScan} />
      </div>

      {loading && <div className="text-center">Loading...</div>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {unit && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{unit.item_name}</h2>
            <div className="space-y-1">
              <div><strong>Barcode:</strong> {unit.barcode}</div>
              <div><strong>Category:</strong> {unit.category}</div>
              <div><strong>Location:</strong> {unit.location || 'Not set'}</div>
              <div><strong>Status:</strong> {unit.status}</div>
            </div>
          </div>

          {unit.contains && unit.contains.length > 0 && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-bold mb-2">Contains:</h3>
              <ul className="list-disc list-inside">
                {unit.contains.map((item, idx) => (
                  <li key={idx}>
                    {item.quantity} {item.unit} - {item.child_item_name || item.child_barcode}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => {
                const newLoc = prompt('New location:');
                if (newLoc) handleMove(newLoc);
              }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded"
            >
              Move Location
            </button>

            <button
              onClick={() => {
                const orgId = prompt('Organization ID:');
                const programId = prompt('Program ID (optional):') || undefined;
                const value = parseFloat(prompt('Donation value:') || '0');
                if (orgId) handleCheckout(orgId, programId || '', value);
              }}
              className="w-full px-4 py-2 bg-green-500 text-white rounded"
            >
              Checkout
            </button>
          </div>

          <div className="mt-4">
            <LabelPrinter
              data={{
                barcode: unit.barcode,
                itemName: unit.item_name,
                internalId: unit.id,
                containerPath: unit.location
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
