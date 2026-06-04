import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SlideOver from '../components/SlideOver.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { createItem, listItems, updateItem } from '../api.js';

export default function Items() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [openItem, setOpenItem] = useState(null);
  const [editIdentifier, setEditIdentifier] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThreshold, setEditThreshold] = useState('0');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [newIdentifier, setNewIdentifier] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newThreshold, setNewThreshold] = useState('0');
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');

  async function refresh() {
    const data = await listItems();
    setItems(data.items);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh()
      .catch((e) => {
        if (!cancelled) setLoadError(e.message || 'Failed to load items');
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

  function openEditor(item) {
    setOpenItem(item);
    setEditIdentifier(item.itemIdentifier);
    setEditDescription(item.itemDescription);
    setEditThreshold(String(item.minSafetyThreshold ?? 0));
    setSaveMessage('');
  }

  async function save() {
    if (!openItem) return;
    const threshold = Number(editThreshold);
    if (!Number.isInteger(threshold) || threshold < 0) {
      setSaveMessage('Minimum Safety Threshold must be a whole number ≥ 0');
      return;
    }
    setSaving(true);
    setSaveMessage('');
    try {
      await updateItem(openItem.id, {
        itemDescription: editDescription.trim(),
        minSafetyThreshold: threshold
      });
      await refresh();
      setSaveMessage('Saved');
      setOpenItem((prev) =>
        prev
          ? {
              ...prev,
              itemDescription: editDescription.trim(),
              minSafetyThreshold: threshold
            }
          : prev
      );
    } catch (e) {
      setSaveMessage(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function create(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateMessage('');
    try {
      const threshold = Number(newThreshold);
      if (!Number.isInteger(threshold) || threshold < 0) {
        throw new Error('Minimum Safety Threshold must be a whole number ≥ 0');
      }
      const payload = {
        itemIdentifier: newIdentifier.trim(),
        itemDescription: newDescription.trim(),
        minSafetyThreshold: threshold
      };
      await createItem(payload);
      setNewIdentifier('');
      setNewDescription('');
      setNewThreshold('0');
      await refresh();
      setCreateMessage('Item created');
    } catch (err) {
      setCreateError(err.message || 'Failed to create item');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Items Catalog"
        subtitle="Manage the master stationery catalog and safety thresholds. Stock is computed from logs."
      />

      {loadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="input sm:max-w-md"
              placeholder="Search items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="text-xs text-slate-500">{loading ? 'Loading…' : `${filtered.length} item(s)`}</div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Item</th>
                  <th className="th">Current</th>
                  <th className="th">Threshold</th>
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
                      <button
                        type="button"
                        className="btn btn-secondary px-3 py-1.5"
                        onClick={() => openEditor(i)}
                      >
                        Edit
                      </button>
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

        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900">Create Item</div>
          <div className="mt-1 text-sm text-ui-muted">Adds a new catalog entry with its safety threshold.</div>

          <form onSubmit={create} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item Identifier</label>
              <input
                className="input mt-1"
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item Description</label>
              <input
                className="input mt-1"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Minimum Safety Threshold
              </label>
              <input
                className="input mt-1"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
              />
            </div>

            {createError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{createError}</div>
            ) : null}
            {createMessage ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {createMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary w-full px-4 py-2.5"
            >
              {creating ? 'Creating…' : 'Create Item'}
            </button>
          </form>
        </Card>
      </div>

      <SlideOver
        open={Boolean(openItem)}
        title={openItem ? `${openItem.itemIdentifier} — Edit Item` : 'Edit Item'}
        onClose={() => {
          setOpenItem(null);
          setSaveMessage('');
        }}
        footer={
          openItem ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : null
        }
      >
        {openItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item Identifier</div>
                <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  {editIdentifier}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Current Stock</div>
                <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  {items.find((i) => i.id === openItem.id)?.currentStock ?? '—'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item Description</label>
              <input
                className="input mt-1"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Minimum Safety Threshold
              </label>
              <input
                className="input mt-1"
                value={editThreshold}
                onChange={(e) => setEditThreshold(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-ui-border bg-ui-bg px-4 py-3">
              <div className="text-sm text-slate-700">Low stock status is based on Current Stock ≤ Threshold.</div>
              <StatusPill status={items.find((i) => i.id === openItem.id)?.stockStatus ?? 'GOOD'} />
            </div>

            {saveMessage ? <div className="text-sm text-ui-muted">{saveMessage}</div> : null}
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}
