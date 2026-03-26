'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['Electronics', 'Accessories', 'Wallet', 'Clothing', 'Books', 'Keys', 'Other'];
const CAMPUSES = ['San Bartolome Campus', 'San Francisco Campus', 'Batasan Campus'];

export default function ManagePage() {
  const { token } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNew = searchParams.get('new') === '1';

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: itemData, error } = await supabase
        .from('items')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !itemData) { setNotFound(true); setLoading(false); return; }
      setItem(itemData);
      setEditForm(itemData);

      const { data: claimsData } = await supabase
        .from('claims')
        .select('*')
        .eq('item_id', itemData.id)
        .order('created_at', { ascending: false });
      setClaims(claimsData || []);
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  const manageUrl = typeof window !== 'undefined' ? `${window.location.origin}/manage/${token}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(manageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditChange = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleNewImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let image_url = item.image_url;

      if (newImageFile) {
        const ext = newImageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('item-images').upload(fileName, newImageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('items')
        .update({ ...editForm, image_url })
        .eq('token', token)
        .select()
        .single();

      if (error) throw error;
      setItem(data);
      setEditing(false);
      setNewImageFile(null);
      setNewImagePreview(null);
      setActionMsg('✅ Item updated successfully!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setActionMsg('❌ ' + (err.message || 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await supabase.from('items').delete().eq('token', token);
      router.push('/items');
    } catch (err) {
      setActionMsg('❌ Delete failed.');
    }
  };

  const handleClaimAction = async (claimId, action) => {
    try {
      await supabase.from('claims').update({ status: action }).eq('id', claimId);

      if (action === 'accepted') {
        // Reject all other claims
        await supabase.from('claims').update({ status: 'rejected' }).eq('item_id', item.id).neq('id', claimId);
        await supabase.from('items').update({ 
          status: 'claimed',
          claimed_at: new Date().toISOString()
          }).eq('id', item.id);
        setItem(prev => ({ ...prev, status: 'claimed' }));
      } else if (action === 'rejected') {
        // Check if any claims are still pending
        const remaining = claims.filter(c => c.id !== claimId && c.status === 'pending');
        if (remaining.length === 0) {
          await supabase.from('items').update({ status: 'available' }).eq('id', item.id);
          setItem(prev => ({ ...prev, status: 'available' }));
        }
      }

      setClaims(prev => prev.map(c => {
        if (c.id === claimId) return { ...c, status: action };
        if (action === 'accepted' && c.id !== claimId) return { ...c, status: 'rejected' };
        return c;
      }));

      setActionMsg(action === 'accepted' ? '🎉 Claim accepted! Item marked as claimed.' : '❌ Claim rejected.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setActionMsg('Something went wrong.');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f0ebd8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6c7a89] border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  if (notFound) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f0ebd8] flex flex-col items-center justify-center text-center p-8">
        <p className="text-6xl mb-4">🔒</p>
        <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: 'Bebas Neue' }}>Item Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">This manage link is invalid or the item has been removed.</p>
        <Link href="/items" className="btn-amber px-6 py-3 rounded-full font-semibold text-sm">Browse Items</Link>
      </div>
    </>
  );

  const pendingClaims = claims.filter(c => c.status === 'pending');

  return (
    <>
      <Navbar />
      <main className="bg-[#f0ebd8] min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto">

          {/* New post success banner */}
          {isNew && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 animate-fadeSlideUp">
              <div className="flex gap-3">
                <span className="text-3xl">🎉</span>
                <div className="flex-1">
                  <p className="font-bold text-emerald-800 mb-1">Item Posted Successfully!</p>
                  <p className="text-sm text-emerald-700 mb-3">
                    Save this private manage link — it's the only way to edit your post or manage claims.
                  </p>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-emerald-200 px-4 py-2">
                    <span className="text-xs text-gray-500 flex-1 font-mono truncate">{manageUrl}</span>
                    <button onClick={copyLink}
                      className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex-shrink-0">
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/64/64`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge status={item.type} />
                    <StatusBadge status={item.status} />
                  </div>
                  <h1 className="text-2xl text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{item.title}</h1>
                  <p className="text-xs text-gray-400">📍 {item.location} · {item.category}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Link href={`/item/${item.id}`}
                  className="text-xs border border-gray-200 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold">
                  View Public Page
                </Link>
                <button onClick={copyLink}
                  className="text-xs bg-[#f0ebd8] text-[#6c7a89] px-3 py-2 rounded-xl font-semibold hover:bg-[#e5dfc8]">
                  {copied ? '✅ Copied!' : '🔗 Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* Deletion warning */}
          {item.status === 'claimed' && item.claimed_at && (() => {
            const claimedDate = new Date(item.claimed_at);
            const deleteDate = new Date(claimedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            const daysLeft = Math.ceil((deleteDate - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft > 2) return null;
            return (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-red-700">
                    This post deletes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
          Claimed posts are automatically removed after 7 days.
                  </p>
                </div>
              </div>
            );
          })()}
  
          {/* Action message */}
          {actionMsg && (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium mb-4 text-center animate-fadeSlideUp">
              {actionMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'details', label: '📋 Details' },
              { id: 'claims', label: `🙋 Claims ${claims.length > 0 ? `(${claims.length})` : ''}`, badge: pendingClaims.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  activeTab === tab.id ? 'bg-[#6c7a89] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              {editing ? (
                <div className="space-y-4">
                  <h2 className="text-2xl text-[#1a1a2e] mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Edit Item</h2>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                    {(newImagePreview || item.image_url) && (
                      <div className="relative rounded-xl overflow-hidden h-40 mb-2">
                        <img src={newImagePreview || item.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setNewImageFile(null); setNewImagePreview(null); }}
                          className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white">✕</button>
                      </div>
                    )}
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="text-xs border border-dashed border-[#6c7a89] text-[#6c7a89] px-4 py-2 rounded-xl hover:bg-[#f0ebd8]">
                      {item.image_url ? 'Replace Photo' : 'Upload Photo'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleNewImage(e.target.files[0])} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input name="title" value={editForm.title || ''} onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={editForm.description || ''} onChange={handleEditChange} rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] resize-none bg-[#f9f7f2]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select name="category" value={editForm.category || ''} onChange={handleEditChange}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-[#f9f7f2]">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <select name="location" value={editForm.location || ''} onChange={handleEditChange}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-[#f9f7f2]">
                        {CAMPUSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select name="type" value={editForm.type || ''} onChange={handleEditChange}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-[#f9f7f2]">
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select name="status" value={editForm.status || ''} onChange={handleEditChange}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-[#f9f7f2]">
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="claimed">Claimed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setEditing(false); setEditForm(item); setNewImageFile(null); setNewImagePreview(null); }}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 btn-amber py-3 rounded-xl font-bold text-sm disabled:opacity-60">
                      {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Item Details</h2>
                    <button onClick={() => setEditing(true)}
                      className="text-sm btn-navy px-4 py-2 rounded-xl font-semibold">
                      ✏️ Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Title', value: item.title },
                      { label: 'Category', value: item.category },
                      { label: 'Type', value: item.type?.charAt(0).toUpperCase() + item.type?.slice(1) },
                      { label: 'Status', value: <StatusBadge status={item.status} /> },
                      { label: 'Location', value: item.location },
                      { label: 'Date Reported', value: item.date_reported || item.created_at?.split('T')[0] },
                      { label: 'Your Name', value: item.contact_name || '—' },
                      { label: 'Your Contact', value: item.contact_email || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#f9f7f2] rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</p>
                        <div className="text-gray-700 font-medium">{value}</div>
                      </div>
                    ))}
                  </div>

                  {item.description && (
                    <div className="mt-4 bg-[#f9f7f2] rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Description</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  )}

                  {/* Danger zone */}
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Danger Zone</p>
                    {deleteConfirm ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-700 font-semibold mb-3">Are you sure? This cannot be undone.</p>
                        <div className="flex gap-3">
                          <button onClick={() => setDeleteConfirm(false)}
                            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            Cancel
                          </button>
                          <button onClick={handleDelete}
                            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">
                            Yes, Delete Item
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(true)}
                        className="text-sm border border-red-200 text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 font-semibold transition-colors">
                        🗑️ Delete This Item
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              {claims.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-semibold text-gray-500">No claims yet</p>
                  <p className="text-sm text-gray-400 mt-1">Claims from users will appear here.</p>
                </div>
              ) : (
                claims.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 bg-[#f0ebd8] rounded-full flex items-center justify-center text-sm font-bold text-[#6c7a89]">
                            {c.claimant_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-[#1a1a2e]">{c.claimant_name}</p>
                            <p className="text-xs text-gray-400">{c.claimant_contact}</p>
                          </div>
                          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                            c.status === 'pending' ? 'bg-amber-100 text-amber-800'
                            : c.status === 'accepted' ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="bg-[#f9f7f2] rounded-xl p-3 text-sm text-gray-600 mb-3">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Proof of Ownership</p>
                          {c.proof_description}
                        </div>

                        {c.proof_image_url && (
                          <div className="rounded-xl overflow-hidden h-28 w-40 mb-3">
                            <img src={c.proof_image_url} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <p className="text-xs text-gray-400">
                          Submitted {new Date(c.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {c.status === 'pending' && (
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <button onClick={() => handleClaimAction(c.id, 'accepted')}
                            className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors">
                            ✓ Accept
                          </button>
                          <button onClick={() => handleClaimAction(c.id, 'rejected')}
                            className="flex-1 sm:flex-none bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors">
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
