import { useMemo, useState } from 'react';

export default function EmployeeAutocomplete({
  employees,
  value,
  onChange,
  placeholder = 'Search employee…'
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => employees.find((e) => e.id === value) || null,
    [employees, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees.slice(0, 50);
    return employees
      .filter((e) => {
        const hay = `${e.employeeIdentifier} ${e.employeeName}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [employees, query]);

  return (
    <div className="relative">
      <input
        className="input"
        value={
          open
            ? query
            : selected
              ? `${selected.employeeIdentifier} — ${selected.employeeName}`
              : query
        }
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
              filtered.map((e) => (
                <button
                  type="button"
                  key={e.id}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    onChange(e.id);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <div className="min-w-24 font-semibold text-slate-900">{e.employeeIdentifier}</div>
                  <div className="text-slate-700">{e.employeeName}</div>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
            Select an employee from stored records
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
