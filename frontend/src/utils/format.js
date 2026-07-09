export const formatDate = (value) => {
  /** Format date values for a readable display in the UI */
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const isOverdue = (task) => {
  /** Check whether a task is past its due date and still incomplete */
  if (!task?.dueDate || task.status === 'COMPLETED') {
    return false;
  }

  return new Date(task.dueDate).getTime() < Date.now();
};

export const statusTone = (status) => {
  const map = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-200',
    PENDING: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return map[status] || 'bg-slate-100 text-slate-700 ring-slate-200';
};

export const priorityTone = (priority) => {
  const map = {
    HIGH: 'bg-rose-50 text-rose-700 ring-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
    LOW: 'bg-sky-50 text-sky-700 ring-sky-200',
  };

  return map[priority] || 'bg-slate-100 text-slate-700 ring-slate-200';
};