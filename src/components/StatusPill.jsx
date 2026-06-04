export default function StatusPill({ status }) {
  const isLow = status === 'LOW STOCK';
  const classes = isLow
    ? 'border-accent-500 bg-rose-50 text-accent-700'
    : 'border-emerald-300 bg-emerald-50 text-emerald-900';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}
