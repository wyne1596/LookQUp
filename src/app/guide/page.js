import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const GUIDES = [
  {
    id: 'post',
    title: 'How to Post an Item',
    icon: '📋',
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-600',
    dot: 'bg-amber-400',
    steps: [
      {
        number: '01',
        title: 'Go to Post an Item',
        desc: 'Click the "+ Post an Item" button on the homepage or navbar.',
      },
      {
        number: '02',
        title: 'Select Item Type',
        desc: 'Choose whether you Lost something or Found something. This determines how your post appears to others.',
      },
      {
        number: '03',
        title: 'Fill in the Details',
        desc: 'Enter the item title, description, category, date, and which campus it was lost or found at.',
      },
      {
        number: '04',
        title: 'Upload a Photo',
        desc: 'Optionally upload a clear photo of the item. This greatly increases the chance of a match. Max size is 5MB.',
      },
      {
        number: '05',
        title: 'Enter Your Contact Info',
        desc: 'Add your name and email or messenger. This is private and only visible to you via your manage link.',
      },
      {
        number: '06',
        title: 'Save Your Manage Link',
        desc: 'After submitting you will be redirected to your private manage page. Copy and save that URL — it is the only way to manage your post. There is no login system.',
      },
    ],
  },
  {
    id: 'browse',
    title: 'How to Browse Items',
    icon: '🔍',
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-600',
    dot: 'bg-blue-400',
    steps: [
      {
        number: '01',
        title: 'Go to Browse Items',
        desc: 'Click "Browse Items" in the navbar or the "Browse Items" button on the homepage.',
      },
      {
        number: '02',
        title: 'Use the Category Tabs',
        desc: 'Filter by Electronics, Accessories, Wallet, Clothing, Books, Keys, or Other to narrow down results.',
      },
      {
        number: '03',
        title: 'Use the Search Bar',
        desc: 'Type any keyword like the item name or location to search across all posted items.',
      },
      {
        number: '04',
        title: 'Filter by Campus',
        desc: 'Use the campus dropdown to show only items from San Bartolome, San Francisco, or Batasan campus.',
      },
      {
        number: '05',
        title: 'Filter by Type and Status',
        desc: 'Choose to show only Lost items, Found items, or filter by status — Available, Pending, or Claimed.',
      },
      {
        number: '06',
        title: 'Click an Item to View Details',
        desc: 'Click any item card to open the full detail page with the complete description and claim button.',
      },
    ],
  },
  {
    id: 'claim',
    title: 'How to Claim an Item',
    icon: '🙋',
    color: 'bg-emerald-50 border-emerald-200',
    accent: 'text-emerald-600',
    dot: 'bg-emerald-400',
    steps: [
      {
        number: '01',
        title: 'Find the Item',
        desc: 'Browse items and click on the one you believe belongs to you to open the detail page.',
      },
      {
        number: '02',
        title: 'Click Claim This Item',
        desc: 'On the item detail page click the "Claim This Item" button. This only appears if the item is still Available.',
      },
      {
        number: '03',
        title: 'Enter Your Name and Contact',
        desc: 'Provide your full name and a way to contact you such as your email or Facebook Messenger.',
      },
      {
        number: '04',
        title: 'Describe Your Proof of Ownership',
        desc: 'Write something unique about the item that only the real owner would know — a serial number, a sticker, a scratch, or any distinguishing detail.',
      },
      {
        number: '05',
        title: 'Upload Proof Photo (Optional)',
        desc: 'You can upload a photo as additional proof such as a receipt, a previous photo of the item, or any relevant image.',
      },
      {
        number: '06',
        title: 'Submit and Wait',
        desc: 'After submitting, the item status changes to Pending. The poster will review your claim and contact you if accepted.',
      },
    ],
  },
  {
    id: 'manage',
    title: 'How to Use the Manage Page',
    icon: '⚙️',
    color: 'bg-indigo-50 border-indigo-200',
    accent: 'text-indigo-600',
    dot: 'bg-indigo-400',
    steps: [
      {
        number: '01',
        title: 'Open Your Manage Link',
        desc: 'Go to the private URL you saved when you posted your item. It looks like: lookqup.vercel.app/manage/your-token.',
      },
      {
        number: '02',
        title: 'View Your Item Details',
        desc: 'The Details tab shows all the information about your post including title, category, location, and status.',
      },
      {
        number: '03',
        title: 'Edit Your Item',
        desc: 'Click the Edit button to update any details such as title, description, photo, location, or status.',
      },
      {
        number: '04',
        title: 'View Claims',
        desc: 'Click the Claims tab to see all claim submissions. Each claim shows the claimant name, contact, and their proof of ownership.',
      },
      {
        number: '05',
        title: 'Accept or Reject a Claim',
        desc: 'Click Accept to confirm a claim — the item will be marked as Claimed and all other claims will be automatically rejected. Click Reject to decline a specific claim.',
      },
      {
        number: '06',
        title: 'Delete Your Item',
        desc: 'Scroll to the bottom of the Details tab to find the Delete option. You will be asked to confirm before the item is permanently removed.',
      },
    ],
  },
];

export default function GuidePage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="bg-[#6c7a89] text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f4a300 0%, transparent 60%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-amber-300 text-xs tracking-widest uppercase font-semibold mb-2">Documentation</p>
          <h1 className="text-5xl md:text-6xl leading-none mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            How to Use LookQUp
          </h1>
          <p className="text-white/70 text-sm max-w-lg">
            A complete step-by-step guide to posting, browsing, claiming, and managing lost and found items.
          </p>
        </div>
      </section>

      <main className="bg-[#f0ebd8] min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Quick nav */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Jump To</p>
            <div className="flex flex-wrap gap-2">
              {GUIDES.map(g => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="flex items-center gap-1.5 bg-[#f0ebd8] text-[#6c7a89] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#6c7a89] hover:text-white transition-colors"
                  >
                  <span>{g.icon}</span>
                  <span>{g.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Guide sections */}
          {GUIDES.map(guide => (
            <div
              key={guide.id}
              id={guide.id}
              className={`bg-white rounded-3xl shadow-sm border overflow-hidden ${guide.color}`}
            >
              {/* Section header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#f0ebd8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {guide.icon}
                </div>
                <div>
                  <h2
                    className="text-2xl text-[#1a1a2e]"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {guide.title}
                  </h2>
                  <p className="text-xs text-gray-400">{guide.steps.length} steps</p>
                </div>
              </div>

              {/* Steps */}
              <div className="px-6 py-5 space-y-0">
                {guide.steps.map((step, index) => (
                  <div key={step.number} className="flex gap-4">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full ${guide.dot} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                        style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        {step.number}
                      </div>
                      {index < guide.steps.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-6 ${index === guide.steps.length - 1 ? 'pb-2' : ''}`}>
                      <p className="font-bold text-sm text-[#1a1a2e] mb-1">{step.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="bg-[#1a1a2e] rounded-3xl p-8 text-center text-white">
            <p className="text-3xl mb-3">🚀</p>
            <h3 className="text-3xl mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Ready to get started?
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Post a lost or found item now — no account needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/post"
                className="btn-amber px-8 py-3 rounded-full font-bold text-sm">
                + Post an Item
              </Link>
              <Link href="/items"
                className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors">
                Browse Items →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}