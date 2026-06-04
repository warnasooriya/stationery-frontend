import { useMemo, useState } from 'react';

export default function Autocomplete({ items, value, onChange, placeholder = 'Search item…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => items.find((i) => i.id === value) || null, [items, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 50);
    return items
      .filter((i) => {
        const hay = `${i.itemIdentifier} ${i.itemDescription}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [items, query]);

  return (
    <div className="relative">
      <input
        className="input"
        value={open ? query : selected ? `${selected.itemIdentifier} — ${selected.itemDescription}` : query}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setOpen(true);
          setQuery(e.target.value);
        }}
      />
      {open ? (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-ui-border bg-white shadow-xl">
          <div className="max-h-72 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
            ) : (
              filtered.map((i) => (
                <button
                  type="button"
                  key={i.id}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(i.id);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <div className="min-w-24 font-semibold text-slate-900">{i.itemIdentifier}</div>
                  <div className="text-slate-700">{i.itemDescription}</div>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
            Select an item to issue from tracked inventory
          </div>
        </div>
      ) : null}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-0 cursor-default"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
