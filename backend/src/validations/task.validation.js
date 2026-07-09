import Joi from 'joi';

const taskPrioritySchema = Joi.string()
  .trim()
  .valid('LOW', 'MEDIUM', 'HIGH')
  .allow('')
  .optional();
const taskStatusSchema = Joi.string()
  .trim()
  .valid('PENDING', 'IN_PROGRESS', 'COMPLETED')
  .allow('')
  .optional();

export const validateTaskDates = (value) => {
  /** Ensure a task's due date is not earlier than its start date when both are provided */
  if (!value.startDate || !value.dueDate) {
    return; // Skip validation if one of the dates is not provided
  }

  const startDate = new Date(value.startDate);
  const dueDate = new Date(value.dueDate);

  if (dueDate < startDate) {
    throw new Error('Due date must not be earlier than the start date.');
  }
};

export const createTaskSchema = Joi.object({
  /** Validate task creation payloads before they reach the controller */
  body: Joi.object({
    title: Joi.string().trim().min(2).max(120).required(),
    description: Joi.string().trim().allow('').optional(),
    priority: taskPrioritySchema,
    status: taskStatusSchema,
    startDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    assignedToId: Joi.string().trim().required(),
  })
    .required()
    .external(validateTaskDates),
});

export const listTasksQuerySchema = Joi.object({
  query: Joi.object({
    search: Joi.string().trim().allow('').optional(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    assignedToId: Joi.string().trim().optional(),
    sortBy: Joi.string()
      .valid(
        'title',
        'priority',
        'status',
        'startDate',
        'dueDate',
        'createdAt',
        'updatedAt',
      )
      .optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
});

export const taskIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
});

export const updateTaskSchema = Joi.object({
  /** Validate partial task updates while allowing the same date rules */
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(120).optional(),
    description: Joi.string().trim().allow('').optional(),
    priority: taskPrioritySchema,
    status: taskStatusSchema,
    startDate: Joi.date().optional(),
    dueDate: Joi.date().optional(),
    assignedToId: Joi.string().trim().optional(),
  })
    .min(1)
    .external(validateTaskDates),
});
