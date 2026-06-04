import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { createEmployee, listEmployees } from '../api.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [employeeIdentifier, setEmployeeIdentifier] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    const data = await listEmployees();
    setEmployees(data.employees);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh()
      .catch((e) => {
        if (!cancelled) setLoadError(e.message || 'Failed to load employees');
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
    if (!q) return employees;
    return employees.filter((e) => {
      const hay = `${e.employeeIdentifier} ${e.employeeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [employees, query]);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        employeeIdentifier: employeeIdentifier.trim(),
        employeeName: employeeName.trim()
      };
      await createEmployee(payload);
      setEmployeeIdentifier('');
      setEmployeeName('');
      await refresh();
      setMessage('Employee added');
    } catch (err) {
      setError(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Maintain the stored employee list used by Issuance. Issuance selects employees from this list."
      />

      {loadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="input sm:max-w-md"
              placeholder="Search employees…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="text-xs text-slate-500">{loading ? 'Loading…' : `${filtered.length} employee(s)`}</div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Employee ID</th>
                  <th className="th">Employee Name</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 text-sm">
                    <td className="td font-semibold text-slate-900">{e.employeeIdentifier}</td>
                    <td className="td text-slate-700">{e.employeeName}</td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-slate-500" colSpan={2}>
                      Loading employees…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-slate-500" colSpan={2}>
                      No employees found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900">Add Employee</div>
          <div className="mt-1 text-sm text-ui-muted">Create a stored employee record for selection.</div>

          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Employee ID</label>
              <input
                className="input mt-1"
                value={employeeIdentifier}
                onChange={(e) => setEmployeeIdentifier(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Employee Name</label>
              <input
                className="input mt-1"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
            ) : null}
            {message ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full px-4 py-2.5"
            >
              {submitting ? 'Adding…' : 'Add Employee'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
