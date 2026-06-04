import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusPill from '../components/StatusPill.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';
import { exportUrl, listItems } from '../api.js';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refreshItems() {
    const data = await listItems();
    setItems(data.items);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refreshItems()
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load items');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const hay = `${i.itemIdentifier} ${i.itemDescription}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Stock Ledger & Bin Cards"
        subtitle="Current Stock is computed as Total Purchased minus Total Issued."
        actions={
          <a
            className="btn btn-secondary"
            href={exportUrl('inventory')}
          >
            Export Inventory (.xlsx)
          </a>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            className="input lg:max-w-md"
            placeholder="Search by identifier or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-xs lg:text-sm text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} item(s) shown`}
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        ) : null}

        <div className="mt-4 overflow-auto">
          <table className="table lg:table-auto">
            <thead>
              <tr>
                <th className="th">Item</th>
                <th className="th">Current</th>
                <th className="th">Min Threshold</th>
                <th className="th">Status</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 text-sm">
                  <td className="td">
                    <div className="font-semibold text-slate-900">{i.itemIdentifier}</div>
                    <div className="mt-0.5 text-ui-muted">{i.itemDescription}</div>
                  </td>
                  <td className="td font-semibold text-slate-900">{i.currentStock}</td>
                  <td className="td text-slate-700">{i.minSafetyThreshold}</td>
                  <td className="td">
                    <StatusPill status={i.stockStatus} />
                  </td>
                  <td className="td text-right">
                    <Link to={`/inventory/bin-card/${i.id}`} className="btn btn-primary px-3 py-1.5">
                      View Bin Card
                    </Link>
                  </td>
                </tr>
              ))}
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-500" colSpan={5}>
                    Loading items…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-500" colSpan={5}>
                    No items found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
