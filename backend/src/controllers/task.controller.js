import prisma from '../config/database.config.js';
import { ROLES } from '../constants/roles.constant.js';
import {
  notifyTaskAssigned,
  notifyTaskCompleted,
} from '../services/task.notification.service.js';
import {
  deleteTaskAttachmentFiles,
  prepareTaskAttachment,
} from '../utils/task.attachment.util.js';

export { validateTaskDates } from '../validations/task.validation.js';

const TASK_SORT_FIELD_MAP = {
  title: 'title',
  priority: 'priority',
  status: 'status',
  startdate: 'startDate',
  duedate: 'dueDate',
  createdat: 'createdAt',
  updatedat: 'updatedAt',
};

const normalizeEnumValue = (value, fallback) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();
  return normalized || fallback;
};

export const normalizeTaskDateInput = (value) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return value;
};

export const canEditTask = (task) => task?.status !== 'COMPLETED';

export const buildTaskListQuery = (query = {}, user = {}) => {
  const rawSearch =
    typeof query?.search === 'string' ? query.search.trim() : '';
  const rawPage = Number.parseInt(String(query?.page ?? '1'), 10);
  const rawLimit = Number.parseInt(String(query?.limit ?? '10'), 10);
  const safePage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const safeLimit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;
  const sortBy =
    typeof query?.sortBy === 'string'
      ? query.sortBy.toLowerCase()
      : 'createdAt';
  const sortOrder = query?.sortOrder === 'asc' ? 'asc' : 'desc';
  const sortField = TASK_SORT_FIELD_MAP[sortBy] ?? 'createdAt';
  const where = {};

  if (rawSearch) {
    where.OR = [
      { title: { contains: rawSearch } },
      { description: { contains: rawSearch } },
    ];
  }

  if (query?.status) {
    where.status = query.status;
  }

  if (query?.priority) {
    where.priority = query.priority;
  }

  if (query?.assignedToId) {
    where.assignedToId = query.assignedToId;
  }

  if (user?.role !== ROLES.ADMIN) {
    where.assignedToId = user?.id;
  }

  return {
    where,
    orderBy: {
      [sortField]: sortOrder,
    },
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};

export const buildTaskResponse = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  startDate: task.startDate,
  dueDate: task.dueDate,
  assignedToId: task.assignedToId,
  assignedTo: task.assignedTo
    ? {
        id: task.assignedTo.id,
        name: task.assignedTo.fullName,
        email: task.assignedTo.email,
      }
    : null,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const resolveAssignedToId = (body, user) => {
  if (typeof body?.assignedToId === 'string' && body.assignedToId.trim()) {
    return body.assignedToId.trim();
  }

  if (user?.role !== ROLES.ADMIN) {
    return user?.id ?? null;
  }

  return null;
};

export const createTask = async (req, res, next) => {
  let storedAttachment = null;

  try {
    /** Create a task, attach uploaded files when present, and notify the assignee */
    const { title, description, priority, status } = req.body;
    const assignedToId = resolveAssignedToId(req.body, req.user);

    storedAttachment = await prepareTaskAttachment(req.file);

    if (!assignedToId) {
      if (storedAttachment) {
        await deleteTaskAttachmentFiles([storedAttachment]);
      }

      return res.status(400).json({
        message: 'Assigned employee is required.',
      });
    }

    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!assignedUser) {
      if (storedAttachment) {
        await deleteTaskAttachmentFiles([storedAttachment]);
      }

      return res.status(404).json({
        message: 'Assigned employee not found.',
      });
    }

    const task = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.task.create({
        data: {
          title: String(title).trim(),
          description:
            typeof description === 'string' ? description.trim() : '',
          priority: normalizeEnumValue(priority, 'MEDIUM'),
          status: normalizeEnumValue(status, 'PENDING'),
          startDate: normalizeTaskDateInput(req.body.startDate),
          dueDate: normalizeTaskDateInput(req.body.dueDate),
          assignedToId,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (!storedAttachment) {
        return {
          ...createdTask,
          attachment: null,
        };
      }

      const createdAttachment = await tx.attachment.create({
        data: {
          id: storedAttachment.id,
          fileName: storedAttachment.fileName,
          fileUrl: storedAttachment.fileUrl,
          fileType: storedAttachment.fileType,
          fileSize: storedAttachment.fileSize,
          taskId: createdTask.id,
        },
      });

      return {
        ...createdTask,
        attachment: createdAttachment,
      };
    });

    await notifyTaskAssigned(task);

    if (task.status === 'COMPLETED') {
      await notifyTaskCompleted(task);
    }

    return res.status(201).json({
      message: 'Task created successfully',
      task: buildTaskResponse(task),
    });
  } catch (error) {
    if (storedAttachment) {
      await deleteTaskAttachmentFiles([storedAttachment]);
    }

    next(error);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    /** Build a filtered, paginated task list based on query parameters and role */
    const queryOptions = buildTaskListQuery(req.query, req.user);
    const [tasks, totalItems] = await Promise.all([
      prisma.task.findMany({
        ...queryOptions,
        include: {
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.task.count({ where: queryOptions.where }),
    ]);

    const page = Math.floor(queryOptions.skip / queryOptions.take) + 1;
    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / queryOptions.take);

    return res.status(200).json({
      message: 'Tasks retrieved successfully',
      pagination: {
        page,
        limit: queryOptions.take,
        totalItems,
        totalPages,
      },
      tasks: tasks.map(buildTaskResponse),
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    /** Return a single task while enforcing access rules for employees and admins */
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== ROLES.ADMIN && task.assignedToId !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have permission to view this task.',
      });
    }

    return res.status(200).json({
      message: 'Task retrieved successfully',
      task: buildTaskResponse(task),
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        attachment: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== ROLES.ADMIN && task.assignedToId !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have permission to update this task.',
      });
    }

    if (!canEditTask(task)) {
      return res.status(400).json({
        message: 'Completed tasks cannot be edited.',
      });
    }

    const previousTask = task;
    const updateData = {};
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isAdmin) {
      const bodyKeys = Object.keys(req.body || {}).filter(
        (key) => req.body[key] !== undefined,
      );
      const forbidden = bodyKeys.filter((key) => key !== 'status');

      if (forbidden.length > 0) {
        return res.status(400).json({
          message:
            'Employees can only update task status. Forbidden fields: ' +
            forbidden.join(', '),
        });
      }

      if (!bodyKeys.includes('status')) {
        return res.status(400).json({
          message: 'Employees can only update task status.',
        });
      }

      updateData.status = normalizeEnumValue(req.body.status, task.status);
    } else {
      if (typeof req.body.title === 'string' && req.body.title.trim()) {
        updateData.title = req.body.title.trim();
      }

      if (req.body.description !== undefined) {
        updateData.description =
          typeof req.body.description === 'string'
            ? req.body.description.trim()
            : '';
      }

      if (req.body.priority !== undefined) {
        updateData.priority = normalizeEnumValue(
          req.body.priority,
          task.priority,
        );
      }

      if (req.body.status !== undefined) {
        updateData.status = normalizeEnumValue(req.body.status, task.status);
      }

      if (req.body.startDate !== undefined) {
        updateData.startDate = normalizeTaskDateInput(req.body.startDate);
      }

      if (req.body.dueDate !== undefined) {
        updateData.dueDate = normalizeTaskDateInput(req.body.dueDate);
      }

      const assignedToId = resolveAssignedToId(req.body, req.user);
      if (assignedToId !== null) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: assignedToId },
        });

        if (!assignedUser) {
          return res.status(404).json({
            message: 'Assigned employee not found.',
          });
        }

        updateData.assignedToId = assignedToId;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update.',
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        attachment: true,
      },
    });

    if (previousTask.assignedToId !== updatedTask.assignedToId) {
      await notifyTaskAssigned(updatedTask, { reassigned: true });
    }

    if (
      previousTask.status !== 'COMPLETED' &&
      updatedTask.status === 'COMPLETED'
    ) {
      await notifyTaskCompleted(updatedTask);
    }

    return res.status(200).json({
      message: 'Task updated successfully',
      task: buildTaskResponse(updatedTask),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        attachment: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== ROLES.ADMIN && task.assignedToId !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have permission to delete this task.',
      });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    await deleteTaskAttachmentFiles(task.attachment ? [task.attachment] : []);

    return res.status(200).json({
      message: 'Task deleted successfully',
      taskId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
