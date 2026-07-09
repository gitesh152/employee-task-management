import { createPortal } from 'react-dom';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'danger',
}) {
  if (!open) {
    return null;
  }

  const buttonTone = tone === 'danger'
    ? 'bg-rose-600 text-white hover:bg-rose-700'
    : 'bg-slate-950 text-white hover:bg-slate-800';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Confirmation</p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Close confirmation"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${buttonTone}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
