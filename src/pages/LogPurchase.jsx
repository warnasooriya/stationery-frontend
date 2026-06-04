import { useEffect, useMemo, useState } from 'react';
import Autocomplete from '../components/Autocomplete.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';
import { exportUrl, listItems, logPurchase } from '../api.js';

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function LogPurchase() {
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState('');

  const [purchasedAt, setPurchasedAt] = useState(todayIso());
  const [itemId, setItemId] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState('');
  const [supplierSource, setSupplierSource] = useState('');
  const [referenceInvoiceNumber, setReferenceInvoiceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listItems()
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.message || 'Failed to load items');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedItem = useMemo(() => items.find((i) => i.id === itemId) || null, [items, itemId]);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult('');

    try {
      if (!itemId) throw new Error('Select an item from the catalog');
      const payload = {
        purchasedAt,
        itemId,
        quantityReceived: Number(quantityReceived),
        supplierSource,
        referenceInvoiceNumber
      };

      await logPurchase(payload);
      setResult('Purchase logged');
      setQuantityReceived('');
      setSupplierSource('');
      setReferenceInvoiceNumber('');

      const refreshed = await listItems();
      setItems(refreshed.items);
    } catch (err) {
      setError(err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Purchase (Incoming)"
        subtitle="Record restocks/incoming batches. Item must exist in the catalog."
        actions={
          <>
            <a
              className="btn btn-secondary"
              href={exportUrl('purchases')}
            >
              Export Purchases Log (.xlsx)
            </a>
            <a
              className="btn btn-primary"
              href="/items"
            >
              Manage Items
            </a>
          </>
        }
      />

      {loadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</div>
      ) : null}

      <Card>
        <form onSubmit={submit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Date</label>
            <input
              type="date"
              className="input mt-1"
              value={purchasedAt}
              onChange={(e) => setPurchasedAt(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item</label>
            <div className="mt-1">
              <Autocomplete items={items} value={itemId} onChange={setItemId} placeholder="Search items catalog…" />
            </div>
            {selectedItem ? (
              <div className="mt-2 text-xs text-slate-600">
                Selected: <span className="font-semibold text-slate-900">{selectedItem.itemIdentifier}</span>
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quantity Received</label>
            <input
              inputMode="numeric"
              className="input mt-1"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Supplier/Source</label>
            <input
              className="input mt-1"
              value={supplierSource}
              onChange={(e) => setSupplierSource(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Reference Invoice Number
            </label>
            <input
              className="input mt-1"
              value={referenceInvoiceNumber}
              onChange={(e) => setReferenceInvoiceNumber(e.target.value)}
              required
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        ) : null}
        {result ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {result}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary px-5 py-2.5"
          >
            {submitting ? 'Saving…' : 'Save Purchase'}
          </button>
        </div>
        </form>
      </Card>
    </div>
  );
}
