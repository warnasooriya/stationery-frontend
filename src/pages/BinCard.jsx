import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { getBinCard, updateItem } from '../api.js';

function fmtType(type) {
  return type === 'PURCHASE' ? 'Purchase' : 'Issue';
}

export default function BinCard() {
  const params = useParams();
  const itemId = Number(params.itemId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [item, setItem] = useState(null);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const [editThreshold, setEditThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!Number.isFinite(itemId)) {
      setError('Invalid item');
      setLoading(false);
      return;
    }
    setPage(1);
  }, [itemId]);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isFinite(itemId)) return;
    setLoading(true);
    setError('');
    getBinCard(itemId, { page, pageSize })
      .then((data) => {
        if (cancelled) return;
        setItem(data.item);
        setEntries(data.entries);
        setTotal(Number(data.total || 0));
        setPage(Number(data.page || page));
        setPageSize(Number(data.pageSize || pageSize));
        setEditThreshold(String(data.item?.minSafetyThreshold ?? 0));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load bin card');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, page, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  async function saveThreshold() {
    if (!item) return;
    const n = Number(editThreshold);
    if (!Number.isInteger(n) || n < 0) {
      setSaveMessage('Minimum Safety Threshold must be a whole number ≥ 0');
      return;
    }
    setSaving(true);
    setSaveMessage('');
    try {
      await updateItem(item.id, { minSafetyThreshold: n });
      setItem({ ...item, minSafetyThreshold: n, stockStatus: item.currentStock <= n ? 'LOW STOCK' : 'GOOD' });
      setSaveMessage('Saved');
    } catch (e) {
      setSaveMessage(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={item ? `Bin Card — ${item.itemIdentifier}` : 'Bin Card'}
        subtitle={item ? item.itemDescription : 'Running balance per movement (purchases and issuances).'}
        actions={
          <Link to="/inventory" className="btn btn-secondary">
            Back to Inventory
          </Link>
        }
      />

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

      {item ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Stock Summary</div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="text-slate-700">
                    Current Stock: <span className="font-semibold text-slate-900">{item.currentStock}</span>
                  </div>
                  <div className="text-slate-700">
                    Total Purchased: <span className="font-semibold text-slate-900">{item.totalPurchased}</span>
                  </div>
                  <div className="text-slate-700">
                    Total Issued: <span className="font-semibold text-slate-900">{item.totalIssued}</span>
                  </div>
                  <StatusPill status={item.stockStatus} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
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
            </div>

            <div className="mt-4 overflow-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Date</th>
                    <th className="th">Type</th>
                    <th className="th">In</th>
                    <th className="th">Out</th>
                    <th className="th">Running</th>
                    <th className="th">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={`${e.type}-${e.id}`} className="border-b border-slate-100 text-sm">
                      <td className="td text-slate-700">{e.occurredAt}</td>
                      <td className="td font-semibold text-slate-900">{fmtType(e.type)}</td>
                      <td className="td text-slate-900">{e.qtyIn || ''}</td>
                      <td className="td text-slate-900">{e.qtyOut || ''}</td>
                      <td className="td font-semibold text-slate-900">{e.runningStock}</td>
                      <td className="td text-slate-700">
                        {e.type === 'PURCHASE' ? (
                          <div className="space-y-0.5">
                            <div>
                              <span className="font-medium text-slate-900">Supplier:</span> {e.supplierSource}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">Invoice:</span> {e.referenceInvoiceNumber}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div>
                              <span className="font-medium text-slate-900">Employee:</span>{' '}
                              {e.employeeName ? `${e.employeeIdentifier} — ${e.employeeName}` : e.employeeIdentifier}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">Purpose:</span> {e.purposeProject}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {loading ? (
                    <tr>
                      <td className="px-3 py-6 text-sm text-slate-500" colSpan={6}>
                        Loading bin card…
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-sm text-slate-500" colSpan={6}>
                        No history records for this item yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-ui-muted">{total === 0 ? 'No records' : `Showing ${from}–${to} of ${total}`}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <div className="text-sm text-slate-700">
                  Page <span className="font-semibold">{page}</span> / {totalPages}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-4 p-4">
            <div className="text-sm font-semibold text-slate-900">Safety Threshold</div>
            <div className="mt-1 text-sm text-ui-muted">LOW STOCK when Current Stock ≤ Minimum Safety Threshold.</div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Minimum Safety Threshold</div>
              <input className="input mt-1" value={editThreshold} onChange={(e) => setEditThreshold(e.target.value)} />
              {saveMessage ? <div className="mt-2 text-sm text-ui-muted">{saveMessage}</div> : null}
            </div>

            <div className="mt-4">
              <button type="button" className="btn btn-primary w-full" onClick={saveThreshold} disabled={saving}>
                {saving ? 'Saving…' : 'Save Threshold'}
              </button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

