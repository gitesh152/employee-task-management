import clsx from 'clsx';

export default function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone])}>
      {children}
    </span>
  );
}