import Joi from 'joi';

import { passwordRules as basePasswordRules } from './password.validation.js';

const passwordRules = basePasswordRules;

export const listUsersQuerySchema = Joi.object({
  /** Validate employee listing query parameters such as search, sorting, and pagination */
  query: Joi.object({
    search: Joi.string().trim().allow('').optional(),
    sortBy: Joi.string()
      .valid(
        'name',
        'email',
        'department',
        'designation',
        'createdAt',
        'updatedAt',
      )
      .optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
});

export const getUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
});

export const updateUserSchema = Joi.object({
  /** Validate employee profile updates, including password strength rules */
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    department: Joi.string().trim().allow('').optional(),
    designation: Joi.string().trim().allow('').optional(),
    role: Joi.string().valid('ADMIN', 'EMPLOYEE').optional(),
    password: passwordRules.optional(),
  }).min(1),
});

export const deleteUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().trim().required(),
  }),
});
