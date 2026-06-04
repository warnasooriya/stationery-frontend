import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';
import { getDashboard } from '../api.js';

function ActivityChart({ series }) {
  const w = 900;
  const h = 180;
  const padX = 24;
  const padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const max = useMemo(() => {
    let m = 0;
    for (const d of series || []) {
      m = Math.max(m, Number(d.purchasedQty || 0), Number(d.issuedQty || 0));
    }
    return m || 1;
  }, [series]);

  const groupW = innerW / Math.max(1, (series || []).length);
  const barW = Math.max(3, Math.floor(groupW * 0.32));
  const gap = Math.max(2, Math.floor(groupW * 0.08));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <rect x="0" y="0" width={w} height={h} rx="12" fill="#fff" />

      <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={padX} y1={padY} x2={padX} y2={h - padY} stroke="#e5e7eb" strokeWidth="1" />

      {(series || []).map((d, i) => {
        const x0 = padX + i * groupW;
        const purchased = Number(d.purchasedQty || 0);
        const issued = Number(d.issuedQty || 0);
        const ph = Math.round((purchased / max) * innerH);
        const ih = Math.round((issued / max) * innerH);
        const baseY = h - padY;

        const px = x0 + Math.floor((groupW - (barW * 2 + gap)) / 2);
        const ix = px + barW + gap;

        const label = String(d.date || '').slice(5);

        return (
          <g key={d.date || i}>
            <title>{`${d.date} — Purchased: ${purchased}, Issued: ${issued}`}</title>
            <rect x={px} y={baseY - ph} width={barW} height={ph} fill="#9ca3af" rx="3" />
            <rect x={ix} y={baseY - ih} width={barW} height={ih} fill="#dc2626" rx="3" />
            {i % 2 === 0 ? (
              <text x={x0 + groupW / 2} y={h - 2} textAnchor="middle" fontSize="10" fill="#6b7280">
                {label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function ActivityBadge({ type }) {
  const cls =
    type === 'ISSUE'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-slate-200 bg-slate-50 text-slate-800';
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{type}</span>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => {
        if (!cancelled) setData(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data?.stats || null;
  const widgets = data?.widgets || null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="High-level operational view of tracked stationery items, low stock, and logs."
      />

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Tracked Items" value={stats ? stats.totalTrackedItems : '—'} />
        <StatCard
          label="Items Running Low"
          value={stats ? stats.lowStockCount : '—'}
          tone={stats && stats.lowStockCount > 0 ? 'danger' : 'good'}
        />
        <StatCard label="Purchase Log Records" value={stats ? stats.purchaseLogCount : '—'} />
        <StatCard label="Issuance Log Records" value={stats ? stats.issuanceLogCount : '—'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Activity (Last 14 Days)</div>
              <div className="mt-1 text-sm text-ui-muted">Purchased quantity vs issued quantity per day.</div>
            </div>
            <div className="flex items-center gap-3 text-xs text-ui-muted">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-sm bg-slate-400" />
                Purchased
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-sm bg-red-600" />
                Issued
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ActivityChart series={widgets?.activityByDay || []} />
          </div>
        </Card>

        <Card className="lg:col-span-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Low Stock Items</div>
              <div className="mt-1 text-sm text-ui-muted">Items at or below their safety threshold.</div>
            </div>
            <Link to="/inventory" className="btn btn-ghost px-3 py-1.5">
              View All
            </Link>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Item</th>
                  <th className="th">Stock</th>
                </tr>
              </thead>
              <tbody>
                {(widgets?.lowStockItems || []).map((i) => (
                  <tr key={i.id} className="border-b border-slate-100 text-sm">
                    <td className="td">
                      <Link to={`/inventory/bin-card/${i.id}`} className="font-semibold text-slate-900 hover:underline">
                        {i.itemIdentifier}
                      </Link>
                      <div className="mt-0.5 text-ui-muted">{i.itemDescription}</div>
                    </td>
                    <td className="td font-semibold text-red-700">
                      {i.currentStock} / {i.minSafetyThreshold}
                    </td>
                  </tr>
                ))}
                {widgets && (widgets.lowStockItems || []).length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-ui-muted" colSpan={2}>
                      No low stock items.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Top Issued Items</div>
              <div className="mt-1 text-sm text-ui-muted">Highest issued quantities across all time.</div>
            </div>
            <Link to="/logs/issuances" className="btn btn-ghost px-3 py-1.5">
              Report
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(widgets?.topIssuedItems || []).map((r) => (
              <div key={r.itemId} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/inventory/bin-card/${r.itemId}`}
                    className="truncate text-sm font-semibold text-slate-900 hover:underline"
                  >
                    {r.itemIdentifier}
                  </Link>
                  <div className="mt-0.5 truncate text-xs text-ui-muted">{r.itemDescription}</div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-slate-900">{r.quantityIssued}</div>
              </div>
            ))}
            {widgets && (widgets.topIssuedItems || []).length === 0 ? (
              <div className="text-sm text-ui-muted">No issuance records yet.</div>
            ) : null}
          </div>
        </Card>

        <Card className="lg:col-span-8 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
              <div className="mt-1 text-sm text-ui-muted">Latest purchases and issuances.</div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/logs/purchases" className="btn btn-ghost px-3 py-1.5">
                Purchases
              </Link>
              <Link to="/logs/issuances" className="btn btn-ghost px-3 py-1.5">
                Issuances
              </Link>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-lg border border-ui-border">
            {(widgets?.recentActivity || []).map((a) => (
              <div key={`${a.type}-${a.id}`} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ActivityBadge type={a.type} />
                    <div className="text-sm font-semibold text-slate-900">{a.itemIdentifier}</div>
                    <div className="text-sm text-ui-muted">Qty: {a.quantity}</div>
                  </div>
                  <div className="mt-1 text-xs text-ui-muted">
                    {a.occurredAt} — {a.itemDescription}
                    {a.type === 'ISSUE' ? (
                      <>
                        {' '}
                        • {a.employeeName ? `${a.employeeIdentifier} — ${a.employeeName}` : a.employeeIdentifier}
                        {' '}
                        • {a.purposeProject}
                      </>
                    ) : (
                      <>
                        {' '}
                        • Invoice: {a.referenceInvoiceNumber}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {widgets && (widgets.recentActivity || []).length === 0 ? (
              <div className="px-4 py-6 text-sm text-ui-muted">No activity yet.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
