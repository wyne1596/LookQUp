import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from './StatusBadge';

export default function ItemCard({ item }) {
  const fallback = `https://picsum.photos/seed/${item.id}/400/250`;

  return (
    <Link href={`/item/${item.id}`} className="item-card block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={item.image_url || fallback}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge status={item.type} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1a1a2e] text-base truncate mb-1">{item.title}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
          <span>📍</span> {item.location || 'Location not specified'}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(item.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="mt-3">
          <span className="inline-block text-xs bg-[#f0ebd8] text-[#6c7a89] px-3 py-1 rounded-full font-medium">
            {item.category || 'Other'}
          </span>
        </div>
      </div>
    </Link>
  );
}
