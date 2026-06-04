import { NavLink } from 'react-router-dom';
import { useMemo, useState } from 'react';

const navLinkBase =
  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors';

function Icon({ name, active }) {
  const cls = active ? 'text-white' : 'text-white/80 group-hover:text-white';

  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM13 4h7v5h-7V4zM4 16h7v4H4v-4z" />
      </svg>
    );
  }
  if (name === 'inventory') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-8-4-8 4v10l8 4 8-4V7z" />
        <path d="M12 3v18" />
        <path d="M4 7l8 4 8-4" />
      </svg>
    );
  }
  if (name === 'purchase') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v14" />
        <path d="M7 12l5 5 5-5" />
        <path d="M4 21h16" />
      </svg>
    );
  }
  if (name === 'issue') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21V7" />
        <path d="M7 12l5-5 5 5" />
        <path d="M4 3h16" />
      </svg>
    );
  }
  if (name === 'items') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 12V8a2 2 0 0 0-2-2h-4l-2-2H6a2 2 0 0 0-2 2v4" />
        <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6H4z" />
        <path d="M9 15h6" />
      </svg>
    );
  }
  if (name === 'employees') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === 'reports') {
    return (
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${cls}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 17V7" />
        <path d="M12 17V11" />
        <path d="M15 17V9" />
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2z" />
      </svg>
    );
  }
  return null;
}

function SideNavLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        if (isActive) return `${navLinkBase} bg-white/15 text-white`;
        return `${navLinkBase} text-white/90 hover:bg-white/10 hover:text-white`;
      }}
    >
      {({ isActive }) => (
        <>
          <span className={`h-5 w-1 rounded-full ${isActive ? 'bg-white' : 'bg-transparent group-hover:bg-white/40'}`} />
          <Icon name={icon} active={isActive} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/70">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = useMemo(
    () => (
      <div className="flex h-full flex-col">
        <div className="px-4 py-5">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-white">Stationery Inventory</div>
            
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-auto px-2 pb-6">
          <Section title="Overview">
            <SideNavLink to="/" label="Dashboard" icon="dashboard" />
          </Section>

          <Section title="Inventory">
            <SideNavLink to="/inventory" label="Stock Ledger & Bin Cards" icon="inventory" />
          </Section>

          <Section title="Operations">
            <SideNavLink to="/purchase" label="Purchase (Incoming)" icon="purchase" />
            <SideNavLink to="/issue" label="Issue Item (Outgoing)" icon="issue" />
          </Section>

          <Section title="Administration">
            <SideNavLink to="/items" label="Items Catalog" icon="items" />
            <SideNavLink to="/employees" label="Employees" icon="employees" />
          </Section>

          <Section title="Reports">
            <SideNavLink to="/logs/purchases" label="Purchases" icon="reports" />
            <SideNavLink to="/logs/issuances" label="Issuances" icon="reports" />
          </Section>
        </div>

        <div className="border-t border-white/15 px-4 py-4 text-xs text-white/70">
          .
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="min-h-full bg-ui-bg">
      <div className="flex min-h-full">
        <aside className="hidden w-72 flex-col bg-brand-900 md:flex">
          {nav}
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 bg-brand-900 shadow-2xl">
              {nav}
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-brand-900 bg-brand-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn bg-brand-800 text-white hover:bg-brand-700 md:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  Menu
                </button>
                <div>
                  <div className="text-sm font-semibold text-white">Inventory Admin</div>
                  <div className="text-xs text-white/80">Operationally simple, audit-friendly logs</div>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto min-w-0 max-w-7xl flex-1 px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
