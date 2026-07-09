import prisma from '../config/database.config.js';
import { sendEmail } from '../utils/email.util.js';
import logger from '../utils/logger.util.js';

const TASK_NOTIFICATION_TYPES = {
  ASSIGNED: 'TASK_ASSIGNED',
  DUE: 'TASK_DUE',
  COMPLETED: 'TASK_COMPLETED',
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const buildNotificationPayload = (task, type, text, title) => ({
  userId: task.assignedToId,
  taskId: task.id,
  type,
  title,
  message: text,
});

const persistNotification = async (payload) => {
  try {
    await prisma.notification.create({
      data: payload,
    });
  } catch (error) {
    logger.error('Failed to persist task notification.', {
      taskId: payload.taskId,
      userId: payload.userId,
      type: payload.type,
      error: error.message,
    });
  }
};

const deliverTaskEmail = async ({ task, subject, text, html, type, title }) => {
  // Notifications are sent to the employee currently assigned to the task.
  const recipientEmail = task?.assignedTo?.email;

  if (!recipientEmail) {
    logger.warn(
      'Task notification skipped because assigned employee has no email.',
      {
        taskId: task?.id,
        type,
      },
    );
    return;
  }

  await persistNotification(buildNotificationPayload(task, type, text, title));

  try {
    await sendEmail({
      to: recipientEmail,
      subject,
      text,
      html,
    });
  } catch (error) {
    logger.error('Failed to send task notification email.', {
      taskId: task?.id,
      userId: task?.assignedToId,
      type,
      error: error.message,
    });
  }
};

const buildAssignmentMessage = (task, reassigned) => {
  const action = reassigned ? 'reassigned to you' : 'assigned to you';
  const dueDate = formatDateTime(task.dueDate);

  return {
    subject: reassigned
      ? `Task reassigned: ${task.title}`
      : `New task assigned: ${task.title}`,
    title: reassigned
      ? `Task reassigned: ${task.title}`
      : `Task assigned: ${task.title}`,
    text: [
      `Task: ${task.title}`,
      `The task has been ${action}.`,
      `Due date: ${dueDate}`,
      task.description ? `Description: ${task.description}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
  };
};

const buildDueSoonMessage = (task) => ({
  subject: `Task due within 24 hours: ${task.title}`,
  title: `Task due soon: ${task.title}`,
  text: [
    `Task: ${task.title}`,
    `This task is due on ${formatDateTime(task.dueDate)}.`,
    task.description ? `Description: ${task.description}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
});

const buildCompletionMessage = (task) => ({
  subject: `Task completed: ${task.title}`,
  title: `Task completed: ${task.title}`,
  text: [
    `Task: ${task.title}`,
    'The task has been marked complete.',
    task.description ? `Description: ${task.description}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
});

export const notifyTaskAssigned = async (task, { reassigned = false } = {}) => {
  const message = buildAssignmentMessage(task, reassigned);

  await deliverTaskEmail({
    task,
    type: TASK_NOTIFICATION_TYPES.ASSIGNED,
    ...message,
  });
};

export const notifyTaskDueSoon = async (task) => {
  const message = buildDueSoonMessage(task);

  await deliverTaskEmail({
    task,
    type: TASK_NOTIFICATION_TYPES.DUE,
    ...message,
  });
};

export const notifyTaskCompleted = async (task) => {
  const message = buildCompletionMessage(task);

  await deliverTaskEmail({
    task,
    type: TASK_NOTIFICATION_TYPES.COMPLETED,
    ...message,
  });
};

export const scanDueSoonTasks = async () => {
  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Only scan active tasks that are due within the next 24 hours and already have an assignee email.
  const dueTasks = await prisma.task.findMany({
    where: {
      status: {
        not: 'COMPLETED',
      },
      dueDate: {
        gte: now,
        lte: oneDayFromNow,
      },
      assignedTo: {
        email: {
          not: '',
        },
      },
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

  for (const task of dueTasks) {
    // Skip tasks that already have a stored due-soon notification so the cron stays idempotent.
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: task.assignedToId,
        taskId: task.id,
        type: TASK_NOTIFICATION_TYPES.DUE,
      },
      select: {
        id: true,
      },
    });

    if (existingNotification) {
      continue;
    }

    await notifyTaskDueSoon(task);
  }

  return dueTasks.length;
};

export const taskNotificationTypes = TASK_NOTIFICATION_TYPES;
