import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from './StatusBadge';

export default function ItemCard({ item }) {
  const getDaysUntilDeletion = () => {
    if (item.status !== 'claimed' || !item.claimed_at) return null;
    const claimedDate = new Date(item.claimed_at);
    const deleteDate = new Date(claimedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysLeft = Math.ceil((deleteDate - today) / (1000 * 60 * 60 * 24));
  return daysLeft;
};

const daysLeft = getDaysUntilDeletion();
const showWarning = daysLeft !== null && daysLeft <= 2;

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
        {/* Warning badge */}
        {showWarning && (
         <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs font-bold text-center py-1.5">
             ⚠️ Deletes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
         </div>
         )}
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
