import { useMemo, useState } from 'react';

import { api } from '../../app/api';

const reportOptions = [
  { value: 'completed', label: 'Completed tasks' },
  { value: 'pending', label: 'Pending tasks' },
  { value: 'in-progress', label: 'In progress tasks' },
];

const formatOptions = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
];

const downloadReport = async ({ reportType, format, employeeWise }) => {
  /** Request the selected report from the API and trigger a browser download */
  const endpoint = employeeWise ? '/reports/employee-wise' : '/reports';
  const params = new URLSearchParams({ format, reportType });
  if (employeeWise) {
    params.delete('reportType');
  }

  const response = await api.get(`${endpoint}?${params.toString()}`);
  const blob = new Blob([response], { type: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = employeeWise ? 'employee-task-report' : `${reportType}-tasks-report`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  /** Let users export task reports in CSV or Excel format */
  const [reportType, setReportType] = useState('completed');
  const [format, setFormat] = useState('csv');
  const [employeeWise, setEmployeeWise] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');

  const summary = useMemo(() => {
    if (employeeWise) {
      return 'Export all tasks grouped by employee';
    }

    if (reportType === 'in-progress') {
      return 'Export in-progress tasks';
    }

    return `Export ${reportType === 'completed' ? 'completed' : 'pending'} tasks`;
  }, [employeeWise, reportType]);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage('');

    try {
      await downloadReport({ reportType, format, employeeWise });
      setMessage(`Downloaded ${employeeWise ? 'employee-wise' : reportType} report as ${format.toUpperCase()}.`);
    } catch (error) {
      setMessage(error.message || 'Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-glow">
      <p className="text-sm uppercase tracking-[0.3em] text-ink-400">Reports</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-ink-900">Export task reports</h2>
      <p className="mt-4 max-w-2xl text-ink-600">
        Generate task exports for completed tasks, pending tasks, or an employee-wise breakdown. Files download as CSV or Excel.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
          <label className="block text-sm font-semibold text-ink-700">Report type</label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={employeeWise ? 'employee-wise' : reportType}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === 'employee-wise') {
                setEmployeeWise(true);
              } else {
                setEmployeeWise(false);
                setReportType(nextValue);
              }
            }}
          >
            {reportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="employee-wise">Employee-wise report</option>
          </select>

          <label className="mt-5 block text-sm font-semibold text-ink-700">Export format</label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="mt-6 inline-flex items-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isExporting ? 'Preparing export…' : 'Download report'}
          </button>

          {message ? <p className="mt-4 text-sm text-ink-600">{message}</p> : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Preview</p>
          <h3 className="mt-3 text-2xl font-semibold">{summary}</h3>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>• Exports task title, status, priority, assignee, and dates.</li>
            <li>• Supports CSV for spreadsheet workflows and Excel for richer downloads.</li>
            <li>• Employees only see their own assigned tasks in the reports.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}