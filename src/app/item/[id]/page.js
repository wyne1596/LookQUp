'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claim, setClaim] = useState({ claimant_name: '', claimant_contact: '', proof_description: '' });
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
      if (error || !data) { router.push('/items'); return; }
      setItem(data);
      setLoading(false);
    }
    if (id) fetchItem();
  }, [id, router]);

  const handleClaimChange = e => setClaim(c => ({ ...c, [e.target.name]: e.target.value }));

  const handleProofFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
     return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be under 5MB.');
    return;
  }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let proof_image_url = null;

      if (proofFile) {
        const ext = proofFile.name.split('.').pop();
        const fileName = `claims/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, proofFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(fileName);
        proof_image_url = urlData.publicUrl;
      }

      // Insert claim
      const { error: claimError } = await supabase.from('claims').insert([{
        item_id: id,
        ...claim,
        proof_image_url,
        status: 'pending',
      }]);
      if (claimError) throw claimError;

      // Update item status to pending
      await supabase.from('items').update({ status: 'pending' }).eq('id', id);

      setItem(prev => ({ ...prev, status: 'pending' }));
      setClaimSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
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

  return (
    <>
      <Navbar />
      <main className="bg-[#f0ebd8] min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#6c7a89]">Home</Link>
            <span>/</span>
            <Link href="/items" className="hover:text-[#6c7a89]">Items</Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-xs">{item.title}</span>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative h-72 md:h-auto min-h-[300px] bg-gray-100">
                <img
                  src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <StatusBadge status={item.type} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Details */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-[#6c7a89] text-xs font-semibold tracking-widest uppercase mb-1">
                    {item.category}
                  </p>
                  <h1 className="text-3xl md:text-4xl text-[#1a1a2e] mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {item.title}
                  </h1>

                  {item.description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{item.description}</p>
                  )}

                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📍</span>
                      <span>{item.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <span>
                        {item.date_reported
                          ? new Date(item.date_reported).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                          : new Date(item.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏷️</span>
                      <span className="capitalize">{item.type} item</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 space-y-3">
                  {item.status === 'claimed' ? (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center text-sm text-indigo-800 font-semibold">
                      ✅ This item has been claimed
                    </div>
                  ) : item.status === 'pending' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-800 font-semibold">
                      ⏳ A claim is pending review
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClaimForm(true)}
                      className="w-full btn-amber py-3 rounded-xl font-bold text-sm shadow-sm"
                    >
                      🙋 Claim This Item
                    </button>
                  )}
                  <Link href="/items"
                    className="block w-full text-center btn-navy py-3 rounded-xl font-semibold text-sm">
                    ← Back to All Items
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Claim form */}
          {showClaimForm && !claimSuccess && (
            <div className="mt-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fadeSlideUp">
              <h2 className="text-2xl mb-1 text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Submit a Claim</h2>
              <p className="text-sm text-gray-500 mb-6">Provide your details and proof of ownership. The poster will review and respond.</p>

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input
                      name="claimant_name" value={claim.claimant_name} onChange={handleClaimChange} required
                      placeholder="Juan dela Cruz"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info *</label>
                    <input
                      name="claimant_contact" value={claim.claimant_contact} onChange={handleClaimChange} required
                      placeholder="Email or Facebook Messenger"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Ownership *</label>
                  <textarea
                    name="proof_description" value={claim.proof_description} onChange={handleClaimChange} required
                    rows={3} placeholder="Describe something unique about this item that only the owner would know..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] resize-none bg-[#f9f7f2]"
                  />
                </div>

                {/* Proof image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proof Photo (Optional)</label>
                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden h-36">
                      <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setProofFile(null); setProofPreview(null); }}
                        className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">✕</button>
                    </div>
                  ) : (
                    <label className="upload-zone rounded-xl p-6 text-center cursor-pointer block">
                      <p className="text-2xl mb-1">📎</p>
                      <p className="text-xs text-gray-400">Upload a photo as proof (receipt, previous photo, etc.)</p>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleProofFile(e.target.files[0])} />
                    </label>
                  )}
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowClaimForm(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 btn-amber py-3 rounded-xl font-bold text-sm disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit Claim →'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Claim success */}
          {claimSuccess && (
            <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-fadeSlideUp">
              <p className="text-5xl mb-3">🎉</p>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Claim Submitted!</h3>
              <p className="text-sm text-emerald-700">
                Your claim has been sent to the item poster. They'll review your proof and contact you if accepted.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
