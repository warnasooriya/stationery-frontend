export default function SlideOver({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-ui-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-1 text-xs text-ui-muted">Bin Card (Running Balance)</div>
          </div>
          <button
            type="button"
            className="btn btn-secondary px-3 py-1.5"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-ui-border px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
