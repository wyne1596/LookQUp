'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#6c7a89] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="leading-none">
            <p className="text-lg font-bold tracking-widest" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Look<span className="text-amber">Q</span>Up
            </p>
            <p className="text-[10px] opacity-75 -mt-0.5">Lost and Found</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 text-sm">
          {[['/', 'Home'], ['/items', 'Browse Items'], ['/post', 'Post Item'], ['/guide', 'Guide']].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="px-3 py-2 rounded hover:bg-white hover:text-[#6c7a89] transition-colors duration-200 font-medium">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/post"
            className="bg-amber text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-amberdark transition-colors"
          >
            + Report Item
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#5a6a79] px-4 pb-4 pt-2 flex flex-col gap-2 text-sm">
          {[['/', 'Home'], ['/items', 'Browse Items'], ['/post', 'Post Item'], ['/guide', 'Guide']].map(([href, label]) => (           
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded hover:bg-white hover:text-[#6c7a89] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
