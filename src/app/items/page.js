'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ItemCard from '@/components/ItemCard';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Wallet', 'Clothing', 'Books', 'Keys', 'Other'];
const CAMPUSES = ['All Campus', 'San Bartolome', 'San Francisco', 'Batasan Campus'];

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [campus, setCampus] = useState('All Campus');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('items').select('*');

    if (category !== 'All') query = query.eq('category', category);
    if (campus !== 'All Campus') query = query.ilike('location', `%${campus}%`);
    if (type !== 'all') query = query.eq('type', type);
    if (status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);

    query = query.order('created_at', { ascending: sort === 'oldest' });

    const { data, error } = await query;
    if (!error && data) setItems(data);
    setLoading(false);
  }, [search, category, campus, type, status, sort]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  return (
    <>
      <Navbar />

      {/* Header banner */}
      <section className="relative text-white py-14 px-4 overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: 'url("/Qcu_Entrance (Clipped).png")' }} />
         <div className="absolute inset-0 bg-[#6c7a89]/80" />        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-amber-300 text-xs tracking-widest uppercase font-semibold mb-2">Browse</p>
          <h1 className="text-5xl md:text-6xl leading-none mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            All Reported Items
          </h1>
          <p className="text-white/70 text-sm mb-6 max-w-lg">
            Browse lost and found items. Use filters to narrow your search. Find what's yours.
          </p>
          <Link href="/post"
            className="bg-[#f4a300] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-amber-600 transition-colors inline-block">
            + Create New Report
          </Link>
        </div>
      </section>

      <main className="bg-[#f0ebd8] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-[#6c7a89] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex-1 min-w-[180px] relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] transition-colors bg-[#f9f7f2]"
              />
            </div>
            <select
              value={campus}
              onChange={e => setCampus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:border-[#6c7a89] bg-[#f9f7f2] cursor-pointer"
            >
              {CAMPUSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:border-[#6c7a89] bg-[#f9f7f2] cursor-pointer"
            >
              <option value="all">Lost &amp; Found</option>
              <option value="lost">Lost Only</option>
              <option value="found">Found Only</option>
            </select>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:border-[#6c7a89] bg-[#f9f7f2] cursor-pointer"
            >
              <option value="all">Any Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="claimed">Claimed</option>
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:border-[#6c7a89] bg-[#f9f7f2] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white overflow-hidden shadow-sm animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-lg text-gray-500">No items found</p>
              <p className="text-sm mt-1">Try adjusting your filters or post a new item.</p>
              <Link href="/post" className="inline-block mt-6 btn-amber px-6 py-2.5 rounded-full text-sm font-semibold">
                + Post an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
