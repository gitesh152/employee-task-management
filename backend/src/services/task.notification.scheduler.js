import { scanDueSoonTasks } from './task.notification.service.js';
import logger from '../utils/logger.util.js';

const DEFAULT_SCAN_INTERVAL_MS = 60 * 60 * 1000;

let scheduledTaskNotifications = null;

const runNotificationScan = async () => {
  try {
    // Cron work: scan tasks due within 24 hours and create/send notifications for eligible assignees.
    const taskCount = await scanDueSoonTasks();
    logger.info('Task due-soon notification scan completed.', {
      taskCount,
    });
  } catch (error) {
    logger.error('Task due-soon notification scan failed.', {
      error: error.message,
    });
  }
};

export const startTaskNotificationScheduler = async (
  intervalMs = DEFAULT_SCAN_INTERVAL_MS,
) => {
  if (scheduledTaskNotifications) {
    return scheduledTaskNotifications;
  }

  // Run once on startup, then repeat on the configured interval.
  await runNotificationScan();

  scheduledTaskNotifications = setInterval(() => {
    void runNotificationScan();
  }, intervalMs);

  return scheduledTaskNotifications;
};

export const stopTaskNotificationScheduler = () => {
  if (!scheduledTaskNotifications) {
    return;
  }

  clearInterval(scheduledTaskNotifications);
  scheduledTaskNotifications = null;
};
