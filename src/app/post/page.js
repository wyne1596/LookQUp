'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['Electronics', 'Accessories', 'Wallet', 'Clothing', 'Books', 'Keys', 'Other'];
const CAMPUSES = ['San Bartolome Campus', 'San Francisco Campus', 'Batasan Campus', 'Other'];

export default function PostPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Other',
    type: 'lost', location: '', date_reported: '',
    contact_name: '', contact_email: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
     alert('Only image files are allowed.');
     return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be under 5MB.');
    return;
  }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let image_url = null;
      const token = uuidv4();

      // Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }

      // Insert item
      const { data, error: insertError } = await supabase
        .from('items')
        .insert([{
          ...form,
          token,
          image_url,
          status: 'available',
          date_reported: form.date_reported || new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to manage page with token
      router.push(`/manage/${token}?new=1`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#f0ebd8] min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[#f4a300] text-xs font-semibold tracking-widest uppercase mb-1">New Report</p>
            <h1 className="text-5xl text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Post an Item</h1>
            <p className="text-gray-500 text-sm mt-2">
              Fill in the details below. You'll receive a private manage link — <strong>save it!</strong> It's how you manage your post.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type toggle */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Item Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {['lost', 'found'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-3 rounded-xl font-bold text-sm capitalize transition-colors ${
                      form.type === t
                        ? t === 'lost'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'lost' ? '😟 I Lost Something' : '🎉 I Found Something'}
                  </button>
                ))}
              </div>
            </div>

            {/* Main details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Details</label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Title *</label>
                <input
                  name="title" value={form.title} onChange={handleChange} required
                  placeholder="e.g. Black Samsung Phone, Blue Umbrella..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] focus:ring-1 focus:ring-[#6c7a89]/20 transition bg-[#f9f7f2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Describe the item — color, brand, distinguishing features..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] resize-none bg-[#f9f7f2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category" value={form.category} onChange={handleChange}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2] cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date" name="date_reported" value={form.date_reported} onChange={handleChange}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <select
                  name="location" value={form.location} onChange={handleChange}
                  required
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2] cursor-pointer"
                >
                  <option value="">Select campus...</option>
                  {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Photo (Optional)</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden h-48">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-white/90 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-sm font-bold shadow"
                  >✕</button>
                </div>
              ) : (
                <div
                  className={`upload-zone rounded-xl p-10 text-center cursor-pointer ${dragging ? 'dragging' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <p className="text-3xl mb-2">📷</p>
                  <p className="text-sm text-gray-500 font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Contact (Private)</label>
              <p className="text-xs text-gray-400 -mt-2">This is only shown to you via your manage link. Not publicly visible.</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    name="contact_name" value={form.contact_name} onChange={handleChange}
                    placeholder="Juan dela Cruz"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email / Messenger</label>
                  <input
                    name="contact_email" value={form.contact_email} onChange={handleChange}
                    placeholder="juan@qcu.edu.ph"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c7a89] bg-[#f9f7f2]"
                  />
                </div>
              </div>
            </div>

            {/* Warning box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="text-xs text-amber-800">
                <p className="font-bold mb-1">Save Your Manage Link!</p>
                <p>After submitting, you'll be redirected to your private manage page. Bookmark or copy that URL — it's the only way to edit, delete, or accept claims on your item. There is no login system.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-amber py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : 'Post Item →'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
