import { useState } from 'react';

import FormField from './FormField';

function EyeIcon({ open }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3 3 0 0 0 13.42 13.42" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.06A10.42 10.42 0 0 1 12 4.5c6 0 9.75 7.5 9.75 7.5a18.2 18.2 0 0 1-3.4 4.42" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.1 6.1C3.92 7.98 2.25 12 2.25 12s3.75 7.5 9.75 7.5c1.17 0 2.26-.16 3.27-.45" />
    </svg>
  );
}

export default function PasswordField({ label, error, value, onChange, placeholder, autoComplete, hint, inputClassName }) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={
            inputClassName ||
            'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100'
          }
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-2xl px-4 text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </FormField>
  );
}