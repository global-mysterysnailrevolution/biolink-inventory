'use client';

import { useState, useEffect } from 'react';

interface Distribution {
  timestamp: string;
  org_id: string;
  program_id: string;
  donation_value: string;
  notes: string;
  barcode: string;
  item_name: string;
  org_name: string;
}

export default function ReportsPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    orgId: '',
    programId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDistributions();
  }, [filters]);

  async function loadDistributions() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.orgId) params.append('orgId', filters.orgId);
      if (filters.programId) params.append('programId', filters.programId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/reports/distributions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load distributions');

      const data = await response.json();
      setDistributions(data.distributions || []);
    } catch (error) {
      console.error('Error loading distributions:', error);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const headers = ['Date', 'Barcode', 'Item', 'Organization', 'Program', 'Donation Value', 'Notes'];
    const rows = distributions.map(d => [
      new Date(d.timestamp).toLocaleDateString(),
      d.barcode,
      d.item_name,
      d.org_name || d.org_id,
      d.program_id || '',
      d.donation_value || '0',
      d.notes || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distributions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const totalValue = distributions.reduce((sum, d) => {
    return sum + parseFloat(d.donation_value || '0');
  }, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Distribution Reports</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold mb-2">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Organization ID</label>
            <input
              type="text"
              value={filters.orgId}
              onChange={(e) => setFilters(prev => ({ ...prev, orgId: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Program ID</label>
            <input
              type="text"
              value={filters.programId}
              onChange={(e) => setFilters(prev => ({ ...prev, programId: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Distributions</p>
            <p className="text-2xl font-bold">{distributions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Donation Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : distributions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No distributions found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Organization</th>
                <th className="p-2 text-left">Program</th>
                <th className="p-2 text-right">Value</th>
                <th className="p-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map((dist, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{new Date(dist.timestamp).toLocaleDateString()}</td>
                  <td className="p-2">{dist.item_name} ({dist.barcode})</td>
                  <td className="p-2">{dist.org_name || dist.org_id}</td>
                  <td className="p-2">{dist.program_id || '-'}</td>
                  <td className="p-2 text-right">${parseFloat(dist.donation_value || '0').toFixed(2)}</td>
                  <td className="p-2">{dist.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
