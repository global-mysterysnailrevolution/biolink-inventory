'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin role required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/users" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Manage Users</h2>
          <p className="text-gray-600">Create and manage user accounts and roles</p>
        </Link>

        <Link href="/admin/organizations" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Organizations</h2>
          <p className="text-gray-600">Manage organizations and programs</p>
        </Link>

        <Link href="/admin/reports" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Reports</h2>
          <p className="text-gray-600">View inventory and distribution reports</p>
        </Link>

        <Link href="/admin/inventory" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Inventory Report</h2>
          <p className="text-gray-600">View current inventory on hand</p>
        </Link>

        <Link href="/admin/audit" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">Audit Trail</h2>
          <p className="text-gray-600">View complete audit log</p>
        </Link>
      </div>
    </div>
  );
}
