'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import { supabase } from '@/lib/supabase';

const FAQ_ITEMS = [
  { q: 'What is LookQUp?', a: 'LookQUp is a lost and found tracking portal designed for QCU students to report and recover lost belongings — no account required.' },
  { q: 'Who can use LookQUp?', a: 'Students, staff, and faculty members of Quezon City University can post and browse items freely.' },
  { q: 'Why aren\'t School IDs listed?', a: 'For security reasons, IDs must be claimed through the school administration directly.' },
  { q: 'How do I report or claim a lost item?', a: 'Click "Post Item" to submit a lost or found report. Each post gets a private manage link — save it! To claim, visit the item detail page.' },
  { q: 'How will I know if my item has been found?', a: 'When you post an item, save your unique manage link. The poster can accept or reject claim requests from that dashboard.' },
  { q: 'What proof do I need to claim an item?', a: 'You\'ll need to describe ownership proof (e.g. serial number, unique marks, a photo). The poster verifies and decides.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-none">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-left text-sm font-semibold text-[#1a1a2e] hover:text-[#6c7a89] transition-colors"
      >
        <span>{q}</span>
        <span className="text-xl text-[#f4a300] ml-4 flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      <div className={`faq-answer text-sm text-gray-600 leading-relaxed ${open ? 'open pb-4' : ''}`}>
        {a}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const sliderRef = useRef(null);

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      if (data) setItems(data);
    }
    fetchItems();
  }, []);

  const scroll = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  const filtered = items.filter(i =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Placeholder cards for when Supabase isn't connected yet
  const placeholderItems = [
    { id: 'p1', title: 'Silver Analog Watch', location: 'San Bartolome Campus', type: 'found', status: 'available', category: 'Accessories', created_at: new Date().toISOString() },
    { id: 'p2', title: 'Golden Pearl Ring', location: 'Main Campus', type: 'lost', status: 'available', category: 'Accessories', created_at: new Date().toISOString() },
    { id: 'p3', title: 'Pink Compact Wallet', location: 'Registrar Building', type: 'lost', status: 'pending', category: 'Wallet', created_at: new Date().toISOString() },
    { id: 'p4', title: 'Black Earphones', location: 'Library', type: 'found', status: 'available', category: 'Electronics', created_at: new Date().toISOString() },
    { id: 'p5', title: 'Blue Umbrella', location: 'Canteen', type: 'found', status: 'available', category: 'Other', created_at: new Date().toISOString() },
  ];

  const displayItems = items.length > 0 ? filtered : placeholderItems;

  return (
    <>
      <Navbar/>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1a1a2e]">
        {/* Background gradient atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d3a4a] to-[#1a1a2e]" />
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/Qcu_Entrance.png")' }} />
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        <div className="relative z-10 text-center px-4 animate-fadeSlideUp">
          <p className="text-[#f4a300] text-xs font-semibold tracking-[0.3em] uppercase mb-6">Quezon City University</p>
          <h1 className="text-white leading-none mb-4"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(4rem, 14vw, 10rem)', letterSpacing: '0.04em' }}>
            LOOK<span className="text-[#f4a300]">Q</span>UP
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-2 font-light">Find Smarter. Return Smarter. Connect Better.</p>
          <p className="text-white/50 text-sm mb-10">A Secure and Centralized Lost &amp; Found Tracking Portal</p>

          {/* Search bar */}
          <div className="flex items-center max-w-xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3 gap-3 mb-8">
            <span className="text-white/50 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search for a lost item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/items"
              className="btn-amber px-8 py-3 rounded-full font-semibold text-sm shadow-lg">
              Browse Items →
            </Link>
            <Link href="/post"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors">
              + Post an Item
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs">
          <span>scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ─── RECENTLY REPORTED ─── */}
      <section className="bg-[#f0ebd8] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#6c7a89] text-xs font-semibold tracking-widest uppercase mb-1">Latest Reports</p>
              <h2 className="text-3xl md:text-4xl text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                Recently Reported Items
              </h2>
            </div>
            <Link href="/items"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#6c7a89] hover:text-[#f4a300] transition-colors">
              View All <span>→</span>
            </Link>
          </div>

          {/* Carousel */}
          <div className="relative">
            <button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f4a300] hover:text-white transition-colors text-gray-600 hidden sm:flex"
            >❮</button>

            <div ref={sliderRef}
              className="carousel-track flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory">
              {displayItems.map(item => (
                <div key={item.id} className="snap-start flex-shrink-0 w-64">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f4a300] hover:text-white transition-colors text-gray-600 hidden sm:flex"
            >❯</button>
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/items" className="text-sm font-semibold text-[#6c7a89] underline">View All Items →</Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#f4a300] text-xs font-semibold tracking-widest uppercase mb-2">The Process</p>
          <h2 className="text-4xl md:text-5xl mb-4 text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            How does <span className="text-[#6c7a89]">LookQUp</span> work?
          </h2>
          <p className="text-gray-500 text-sm mb-14">Find and report your lost items quickly.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#f4a300] to-transparent" />

            {[
              { step: '01', icon: '/step1.png', title: 'Report an Item', desc: 'Submit lost or found items with an image upload, category, and location details.' },
              { step: '02', icon: '/step2.png', title: 'Track & Match', desc: 'Browse recently reported items and filter by category, location, and status.' },
              { step: '03', icon: '/step3.png', title: 'Verify & Claim', desc: 'Ownership verification ensures items are returned securely through token-based management.' },            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-full bg-[#f0ebd8] flex items-center justify-center shadow-inner overflow-hidden">
                    <img src={icon} alt={title} className="w-16 h-16 object-contain" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#f4a300] text-white text-xs font-bold flex items-center justify-center"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-[#1a1a2e] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="bg-[#6c7a89] py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center text-white">
          {[
            { num: '100%', label: 'Free to Use' },
            { num: 'No', label: 'Login Required' },
            { num: '🔒', label: 'Token-Based Privacy' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-bold text-[#f4a300]"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{num}</p>
              <p className="text-xs md:text-sm opacity-70 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-[#f0ebd8] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#f4a300] text-xs font-semibold tracking-widest uppercase mb-2 text-center">Got Questions?</p>
          <h2 className="text-4xl md:text-5xl mb-10 text-center text-[#1a1a2e]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-2xl shadow-sm px-6 py-2">
            {FAQ_ITEMS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-[#1a1a2e] py-16 px-4 text-center">
        <h2 className="text-white text-4xl md:text-5xl mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          Lost something? <span className="text-[#f4a300]">Found something?</span>
        </h2>
        <p className="text-white/60 text-sm mb-8">It only takes a minute to help reunite someone with their belongings.</p>
        <Link href="/post"
          className="btn-amber px-10 py-4 rounded-full font-bold text-base shadow-xl inline-block">
          + Post an Item Now
        </Link>
      </section>

      <Footer />
    </>
  );
}
