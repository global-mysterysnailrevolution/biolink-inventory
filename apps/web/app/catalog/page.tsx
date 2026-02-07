'use client';

import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  photo_url?: string;
}

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadItems();
  }, [category, search]);

  async function loadItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) throw new Error('Failed to load items');

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Public Catalog</h1>
      <p className="text-gray-600 mb-6">Browse available items at Bio-Link Depot</p>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No items found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded shadow">
              {item.photo_url && (
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-bold text-lg mb-1">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              )}
              <div className="text-sm text-gray-500">
                <span className="bg-blue-100 px-2 py-1 rounded">{item.category}</span>
                <span className="ml-2">Unit: {item.unit}</span>
              </div>
              <button className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded">
                Request Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
