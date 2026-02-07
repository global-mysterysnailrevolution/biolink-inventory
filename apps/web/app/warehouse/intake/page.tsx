'use client';

import { useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function IntakePage() {
  const [formData, setFormData] = useState({
    itemId: '',
    barcode: '',
    lotNumber: '',
    expirationDate: '',
    location: '',
    photo: null as File | null
  });
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload photo if present
      let photoUrl = '';
      if (formData.photo) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('photo', formData.photo);
        // Upload photo to storage
        // photoUrl = await uploadPhoto(formDataPhoto);
      }

      // Create unit
      const token = localStorage.getItem('token');
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          photoUrl,
          userId: getUserId() // Get from token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create unit');
      }

      const unit = await response.json();
      alert(`Unit created: ${unit.barcode}`);
      
      // Reset form
      setFormData({
        itemId: '',
        barcode: '',
        lotNumber: '',
        expirationDate: '',
        location: '',
        photo: null
      });
    } catch (error) {
      console.error('Intake error:', error);
      alert('Error creating unit');
    } finally {
      setSubmitting(false);
    }
  }

  function handleScan(barcode: string) {
    setFormData(prev => ({ ...prev, barcode }));
    setScanning(false);
  }

  function getUserId(): string {
    // Extract from JWT token
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return '';
    }
  }

  async function uploadPhoto(formData: FormData): Promise<string> {
    // Implement photo upload
    return '';
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Intake - New Unit</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Item</label>
          <input
            type="text"
            value={formData.itemId}
            onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Barcode</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={() => setScanning(!scanning)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {scanning ? 'Stop Scan' : 'Scan'}
            </button>
          </div>
          {scanning && (
            <div className="mt-2">
              <BarcodeScanner onScan={handleScan} />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1">Lot Number</label>
          <input
            type="text"
            value={formData.lotNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Expiration Date</label>
          <input
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Location/Bin</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.files?.[0] || null }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Unit'}
        </button>
      </form>
    </div>
  );
}
