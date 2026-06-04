export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="card card-pad flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-ui-muted">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
