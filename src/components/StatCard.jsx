export default function StatCard({ label, value, tone = 'neutral' }) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50'
      : tone === 'good'
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-ui-border bg-white';

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-ui-muted">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
