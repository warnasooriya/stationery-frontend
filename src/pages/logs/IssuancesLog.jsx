import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Autocomplete from '../../components/Autocomplete.jsx';
import EmployeeAutocomplete from '../../components/EmployeeAutocomplete.jsx';
import { exportUrl, listEmployees, listIssuances, listItems } from '../../api.js';

export default function IssuancesLog() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const [applied, setApplied] = useState({
    startDate: '',
    endDate: '',
    employeeId: null,
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
    return `${exportUrl('issuances')}${toQuery({
      startDate: applied.startDate,
      endDate: applied.endDate,
      employeeId: applied.employeeId,
      itemId: applied.itemId
    })}`;
  }, [applied]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listEmployees(), listItems()])
      .then(([employeesData, itemsData]) => {
        if (cancelled) return;
        setEmployees(employeesData.employees);
        setItems(itemsData.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listIssuances({
      startDate: applied.startDate || undefined,
      endDate: applied.endDate || undefined,
      employeeId: applied.employeeId || undefined,
      itemId: applied.itemId || undefined,
      page,
      pageSize
    })
      .then((data) => {
        if (cancelled) return;
        setRows(data.issuances);
        setTotal(Number(data.total || 0));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load issuances');
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
        title="Issuance Log"
        subtitle="Outgoing allocations. Employee is selected from stored employees."
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
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Start Date</div>
            <input
              type="date"
              className="input mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">End Date</div>
            <input
              type="date"
              className="input mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Employee</div>
            <div className="mt-1">
              <EmployeeAutocomplete employees={employees} value={employeeId} onChange={setEmployeeId} />
            </div>
            <div className="mt-2">
              <button type="button" className="btn btn-ghost px-3 py-1.5" onClick={() => setEmployeeId(null)}>
                Clear Employee
              </button>
            </div>
          </div>
          <div className="lg:col-span-3">
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
                setApplied({ startDate, endDate, employeeId, itemId });
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
                <th className="th">Employee</th>
                <th className="th">Purpose/Project</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 text-sm">
                  <td className="td text-slate-700">{r.issuedAt}</td>
                  <td className="td">
                    <div className="font-semibold text-slate-900">{r.itemIdentifier}</div>
                    <div className="mt-0.5 text-ui-muted">{r.itemDescription}</div>
                  </td>
                  <td className="td font-semibold text-slate-900">{r.quantityIssued}</td>
                  <td className="td text-slate-700">
                    {r.employeeName ? `${r.employeeIdentifier} — ${r.employeeName}` : r.employeeIdentifier}
                  </td>
                  <td className="td text-slate-700">{r.purposeProject}</td>
                </tr>
              ))}
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-500" colSpan={5}>
                    Loading issuances…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-500" colSpan={5}>
                    No issuance records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-ui-muted">
            {total === 0 ? 'No records' : `Showing ${from}–${to} of ${total}`}
          </div>
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
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setEmployeeId(null);
                setItemId(null);
                setApplied({ startDate: '', endDate: '', employeeId: null, itemId: null });
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
