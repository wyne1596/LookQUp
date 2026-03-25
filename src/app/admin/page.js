'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  const [actionMsg, setActionMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    total: 0, available: 0, pending: 0, claimed: 0, totalClaims: 0
  });

  // Check if already logged in via sessionStorage
  useEffect(() => {
    if (sessionStorage.getItem('lookqup-admin') === 'true') {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  async function fetchData() {
    setLoading(true);

    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: claimsData } = await supabase
      .from('claims')
      .select('*, items(title)')
      .order('created_at', { ascending: false });

    if (itemsData) {
      setItems(itemsData);
      setStats({
        total: itemsData.length,
        available: itemsData.filter(i => i.status === 'available').length,
        pending: itemsData.filter(i => i.status === 'pending').length,
        claimed: itemsData.filter(i => i.status === 'claimed').length,
        totalClaims: claimsData?.length || 0,
      });
    }
    if (claimsData) setClaims(claimsData);
    setLoading(false);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('lookqup-admin', 'true');
      setError('');
    } else {
      setError('Incorrect password. Try again.');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('lookqup-admin');
    setAuthed(false);
    setPassword('');
  }

  async function handleDeleteItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteConfirm(null);
      setActionMsg('✅ Item deleted successfully.');
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  async function handleStatusChange(id, status) {
    const { error } = await supabase.from('items').update({ status }).eq('id', id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      setActionMsg(`✅ Status updated to "${status}".`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  async function handleDeleteClaim(id) {
    const { error } = await supabase.from('claims').delete().eq('id', id);
    if (!error) {
      setClaims(prev => prev.filter(c => c.id !== id));
      setActionMsg('✅ Claim deleted.');
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f0ebd8] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">🔐</p>
            <h1 className="text-3xl text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Admin Panel
            </h1>
            <p className="text-sm text-gray-400 mt-1">LookQUp Staff Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}
            <button
              type="submit"
              className="w-full btn-amber py-3 rounded-xl font-bold text-sm"
            >
              Enter Admin Panel →
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );

  // ── ADMIN DASHBOARD ──
  return (
    <>
      <Navbar />
      <main className="bg-[#f0ebd8] min-h-screen py-10 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#f4a300] text-xs font-semibold tracking-widest uppercase mb-1">Staff Access</p>
              <h1 className="text-5xl text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                Admin Panel
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 font-semibold"
            >
              🚪 Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Total Items', value: stats.total, color: 'text-[#1a1a2e]' },
              { label: 'Available', value: stats.available, color: 'text-emerald-600' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
              { label: 'Claimed', value: stats.claimed, color: 'text-indigo-600' },
              { label: 'Total Claims', value: stats.totalClaims, color: 'text-[#6c7a89]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                <p className={`text-3xl font-bold ${color}`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Action message */}
          {actionMsg && (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium mb-4 text-center">
              {actionMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'items', label: `📋 Items (${items.length})` },
              { id: 'claims', label: `🙋 Claims (${claims.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#6c7a89] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading...</div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No items found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f9f7f2] border-b border-gray-100">
                      <tr>
                        {['Item', 'Type', 'Category', 'Location', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map(item => (
                        <tr key={item.id} className="hover:bg-[#fafaf8] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.image_url || `https://picsum.photos/seed/${item.id}/40/40`}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-[#1a1a2e] truncate max-w-[140px]">{item.title}</p>
                                <Link href={`/item/${item.id}`} target="_blank"
                                  className="text-xs text-[#6c7a89] hover:underline">
                                  View →
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={item.type} />
                          </td>
                          <td className="px-4 py-3 text-gray-500">{item.category}</td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">{item.location}</td>
                          <td className="px-4 py-3">
                            <select
                              value={item.status}
                              onChange={e => handleStatusChange(item.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer outline-none"
                            >
                              <option value="available">Available</option>
                              <option value="pending">Pending</option>
                              <option value="claimed">Claimed</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(item.created_at).toLocaleDateString('en-PH', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            {deleteConfirm === item.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 font-semibold"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(item.id)}
                                className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 font-semibold transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading...</div>
              ) : claims.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No claims yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f9f7f2] border-b border-gray-100">
                      <tr>
                        {['Claimant', 'Item', 'Contact', 'Proof', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {claims.map(claim => (
                        <tr key={claim.id} className="hover:bg-[#fafaf8] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#1a1a2e]">{claim.claimant_name}</td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">
                            {claim.items?.title || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-[140px]">{claim.claimant_contact}</td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-[160px]">{claim.proof_description}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                              claim.status === 'pending' ? 'bg-amber-100 text-amber-800'
                              : claim.status === 'accepted' ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(claim.created_at).toLocaleDateString('en-PH', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteClaim(claim.id)}
                              className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 font-semibold transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
