export default function StatCard({ label, value, helper, accent = 'from-accent-500 to-sky-500' }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-glow backdrop-blur">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-sm font-medium text-ink-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <h3 className="text-3xl font-black tracking-tight text-ink-900">{value}</h3>
      </div>
      {helper ? <p className="mt-2 text-sm text-ink-500">{helper}</p> : null}
    </div>
  );
}