export default function FormField({ label, error, children, hint }) {
  /** Reusable wrapper for form labels, helpers, and inline validation errors */
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink-700">{label}</span>
        {hint ? <span className="text-xs text-ink-400">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}