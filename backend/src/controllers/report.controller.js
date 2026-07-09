import prisma from '../config/database.config.js';
import { ROLES } from '../constants/roles.constant.js';

const REPORT_TYPE_TO_STATUS = {
  completed: 'COMPLETED',
  pending: 'PENDING',
  inprogress: 'IN_PROGRESS',
  'in-progress': 'IN_PROGRESS',
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const formatReportRowsAsCsv = (rows, columns) => {
  const header = columns.join(',');
  const body = rows
    .map((row) =>
      columns.map((column) => escapeCsvValue(row[column])).join(','),
    )
    .join('\n');

  return [header, body].filter(Boolean).join('\n');
};

export const formatReportRowsAsExcel = (rows, columns) => {
  const rowsXml = rows
    .map((row) => {
      const cells = columns
        .map((column) => {
          const value = row[column] ?? '';
          return `<Cell><Data ss:Type="String">${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`;
        })
        .join('');

      return `<Row>${cells}</Row>`;
    })
    .join('');

  const headerCells = columns
    .map((column) => `<Cell><Data ss:Type="String">${column}</Data></Cell>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Report">
    <Table>
      <Row>${headerCells}</Row>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
};

const buildReportRows = (tasks) =>
  tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignedTo:
      task.assignedTo?.fullName || task.assignedTo?.email || 'Unassigned',
    assignedToEmail: task.assignedTo?.email || '',
    startDate: task.startDate ? new Date(task.startDate).toISOString() : '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : '',
    createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : '',
    updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : '',
  }));

const getReportTasks = async (req) => {
  const { reportType = 'completed' } = req.query;
  const status =
    REPORT_TYPE_TO_STATUS[reportType] || REPORT_TYPE_TO_STATUS.completed;

  const where = {
    status,
  };

  if (req.user?.role !== ROLES.ADMIN) {
    where.assignedToId = req.user?.id;
  }

  return prisma.task.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });
};

export const exportTaskReport = async (req, res, next) => {
  try {
    /** Export filtered task data as CSV or Excel based on the requested format */
    const { format = 'csv', reportType = 'completed' } = req.query;
    const tasks = await getReportTasks(req);
    const rows = buildReportRows(tasks);

    const columns = [
      'title',
      'status',
      'priority',
      'assignedTo',
      'assignedToEmail',
      'startDate',
      'dueDate',
      'createdAt',
      'updatedAt',
    ];

    if (format === 'excel') {
      const excelContent = formatReportRowsAsExcel(rows, columns);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${reportType}-tasks-report.xls`,
      );
      return res.send(excelContent);
    }

    const csvContent = formatReportRowsAsCsv(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${reportType}-tasks-report.csv`,
    );
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeTaskReport = async (req, res, next) => {
  try {
    /** Build an employee-centered task report grouped by assignee and sorted by due date */
    const where = {};

    if (req.user?.role !== ROLES.ADMIN) {
      where.assignedToId = req.user?.id;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [{ assignedToId: 'asc' }, { dueDate: 'asc' }],
    });

    const rows = buildReportRows(tasks);
    const columns = [
      'assignedTo',
      'title',
      'status',
      'priority',
      'startDate',
      'dueDate',
      'createdAt',
      'updatedAt',
    ];

    const formatType = req.query.format === 'excel' ? 'excel' : 'csv';
    if (formatType === 'excel') {
      const excelContent = formatReportRowsAsExcel(rows, columns);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=employee-task-report.xls',
      );
      return res.send(excelContent);
    }

    const csvContent = formatReportRowsAsCsv(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=employee-task-report.csv',
    );
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
