import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#6c7a89] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="text-3xl font-bold tracking-widest mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              LOOK<span className="text-amber-400">Q</span>UP
            </p>
            <p className="text-sm opacity-70 mb-4">Lost and Found — Built by QCians for QCians</p>
            <div className="flex gap-4">
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="font-semibold mb-3 text-amber-300 uppercase text-xs tracking-widest">Navigate</p>
            <ul className="space-y-2 text-sm opacity-80">
              {[['/', 'Home'], ['/items', 'Browse Items'], ['/post', 'Post an Item']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-amber-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="font-semibold mb-3 text-amber-300 uppercase text-xs tracking-widest">About</p>
            <p className="text-sm opacity-70 leading-relaxed">
              LookQUp is a secure, centralized Lost &amp; Found tracking portal for the Quezon City University.
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center text-xs opacity-50">
          © 2026 LookQUp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
