export default function StatusBadge({ status }) {
  const map = {
    available: { label: 'Available', classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    pending:   { label: 'Pending',   classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
    claimed:   { label: 'Claimed',   classes: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
    found:     { label: 'Found',     classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    lost:      { label: 'Lost',      classes: 'bg-rose-100 text-rose-800 border border-rose-200' },
  };
  const s = map[status?.toLowerCase()] ?? { label: status, classes: 'bg-gray-100 text-gray-700 border border-gray-200' };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${s.classes}`}>
      {s.label}
    </span>
  );
}
