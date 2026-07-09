export default function Spinner({ label = 'Loading' }) {
  /** Display a lightweight loading indicator for async UI states */
  return (
    <div className="flex items-center gap-3 text-sm text-ink-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-accent-600" />
      <span>{label}</span>
    </div>
  );
}