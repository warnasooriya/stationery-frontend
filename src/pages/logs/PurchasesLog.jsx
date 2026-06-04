import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Autocomplete from '../../components/Autocomplete.jsx';
import { exportUrl, listItems, listPurchases } from '../../api.js';

export default function PurchasesLog() {
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemId, setItemId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const [applied, setApplied] = useState({
    startDate: '',
    endDate: '',
    itemId: null
  });

  function toQuery(params) {
    const parts = [];
    for (const [k, v] of Object.entries(params || {})) {
      if (v === undefined || v === null || v === '') continue;
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
    return parts.length ? `?${parts.join('&')}` : '';
  }

  const exportHref = useMemo(() => {
    return `${exportUrl('purchases')}${toQuery({
      startDate: applied.startDate,
      endDate: applied.endDate,
      itemId: applied.itemId
    })}`;
  }, [applied]);

  useEffect(() => {
    let cancelled = false;
    listItems()
      .then((itemsData) => {
        if (!cancelled) setItems(itemsData.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load items');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listPurchases({
      startDate: applied.startDate || undefined,
      endDate: applied.endDate || undefined,
      itemId: applied.itemId || undefined,
      page,
      pageSize
    })
      .then((data) => {
        if (cancelled) return;
        setRows(data.purchases);
        setTotal(Number(data.total || 0));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load purchases');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases Log"
        subtitle="Incoming/restock records. Clean operational fields only."
        actions={
          <a
            className="btn btn-secondary"
            href={exportHref}
          >
            Export Filtered (.xlsx)
          </a>
        }
      />

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Start Date</div>
            <input
              type="date"
              className="input mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">End Date</div>
            <input
              type="date"
              className="input mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item</div>
            <div className="mt-1">
              <Autocomplete items={items} value={itemId} onChange={setItemId} placeholder="Select item…" />
            </div>
            <div className="mt-2">
              <button type="button" className="btn btn-ghost px-3 py-1.5" onClick={() => setItemId(null)}>
                Clear Item
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 flex items-end gap-2">
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => {
                setApplied({ startDate, endDate, itemId });
                setPage(1);
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Date</th>
                <th className="th">Item</th>
                <th className="th">Qty</th>
                <th className="th">Supplier/Source</th>
                <th className="th">Invoice Ref</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 text-sm">
                  <td className="td text-slate-700">{r.purchasedAt}</td>
                  <td className="td">
                    <div className="font-semibold text-slate-900">{r.itemIdentifier}</div>
                    <div className="mt-0.5 text-ui-muted">{r.itemDescription}</div>
                  </td>
                  <td className="td font-semibold text-slate-900">{r.quantityReceived}</td>
                  <td className="td text-slate-700">{r.supplierSource}</td>
                  <td className="td text-slate-700">{r.referenceInvoiceNumber}</td>
                </tr>
              ))}
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-500" colSpan={5}>
                    Loading purchases…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-500" colSpan={5}>
                    No purchase records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-ui-muted">{total === 0 ? 'No records' : `Showing ${from}–${to} of ${total}`}</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Page Size</div>
              <select
                className="input w-28"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button type="button" className="btn btn-secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <div className="text-sm text-slate-700">
              Page <span className="font-semibold">{page}</span> / {totalPages}
            </div>
            <button type="button" className="btn btn-secondary" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setItemId(null);
                setApplied({ startDate: '', endDate: '', itemId: null });
                setPage(1);
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
