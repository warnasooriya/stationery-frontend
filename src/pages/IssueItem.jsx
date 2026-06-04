import { useEffect, useMemo, useState } from 'react';
import Autocomplete from '../components/Autocomplete.jsx';
import EmployeeAutocomplete from '../components/EmployeeAutocomplete.jsx';
import StatusPill from '../components/StatusPill.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';
import { exportUrl, issueItem, listEmployees, listItems } from '../api.js';

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function IssueItem() {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadError, setLoadError] = useState('');

  const [issuedAt, setIssuedAt] = useState(todayIso());
  const [itemId, setItemId] = useState(null);
  const [quantityIssued, setQuantityIssued] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [purposeProject, setPurposeProject] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([listItems(), listEmployees()])
      .then(([itemsData, employeesData]) => {
        if (cancelled) return;
        setItems(itemsData.items);
        setEmployees(employeesData.employees);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.message || 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(() => items.find((i) => i.id === itemId) || null, [items, itemId]);
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId) || null,
    [employees, employeeId]
  );
  const qty = Number(quantityIssued);
  const wouldExceedStock =
    selected && Number.isFinite(qty) && qty > 0 ? qty > Number(selected.currentStock) : false;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult('');
    try {
      if (!itemId) throw new Error('Select an item');
      if (!employeeId) throw new Error('Select an employee');
      const payload = {
        issuedAt,
        itemId,
        quantityIssued: Number(quantityIssued),
        employeeId,
        purposeProject
      };
      await issueItem(payload);
      setResult('Issuance logged');
      setQuantityIssued('');
      setPurposeProject('');

      const [refreshedItems, refreshedEmployees] = await Promise.all([listItems(), listEmployees()]);
      setItems(refreshedItems.items);
      setEmployees(refreshedEmployees.employees);
    } catch (err) {
      if (err?.data?.currentStock !== undefined) {
        setError(`${err.message}. Current Stock: ${err.data.currentStock}`);
      } else {
        setError(err.message || 'Submit failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Item (Outgoing)"
        subtitle="Allocate stationery to an employee from stored records. Issuance cannot exceed Current Stock."
        actions={
          <>
            <a
              className="btn btn-secondary"
              href={exportUrl('issuances')}
            >
              Export Issuance Log (.xlsx)
            </a>
            <a
              className="btn btn-primary"
              href="/employees"
            >
              Manage Employees
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
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item</label>
            <div className="mt-1">
              <Autocomplete items={items} value={itemId} onChange={setItemId} placeholder="Search tracked items…" />
            </div>
            {selected ? (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="text-slate-600">
                  Current Stock: <span className="font-semibold text-slate-900">{selected.currentStock}</span>
                </div>
                <div className="text-slate-600">
                  Min Threshold: <span className="font-semibold text-slate-900">{selected.minSafetyThreshold}</span>
                </div>
                <StatusPill status={selected.stockStatus} />
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quantity Issued</label>
            <input
              inputMode="numeric"
              className={`input mt-1 ${
                wouldExceedStock ? 'border-rose-300' : 'border-slate-300'
              }`}
              value={quantityIssued}
              onChange={(e) => setQuantityIssued(e.target.value)}
              required
            />
            {wouldExceedStock ? (
              <div className="mt-1 text-xs font-medium text-rose-700">Quantity exceeds Current Stock</div>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Employee</label>
            <div className="mt-1">
              <EmployeeAutocomplete
                employees={employees}
                value={employeeId}
                onChange={setEmployeeId}
                placeholder="Search stored employees…"
              />
            </div>
            {selectedEmployee ? (
              <div className="mt-2 text-xs text-slate-600">
                Selected:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedEmployee.employeeIdentifier} — {selectedEmployee.employeeName}
                </span>
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Purpose/Project</label>
            <input
              className="input mt-1"
              value={purposeProject}
              onChange={(e) => setPurposeProject(e.target.value)}
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
            disabled={submitting || wouldExceedStock || !itemId || !employeeId}
            className="btn btn-primary px-5 py-2.5"
          >
            {submitting ? 'Saving…' : 'Save Issuance'}
          </button>
        </div>
        </form>
      </Card>
    </div>
  );
}
