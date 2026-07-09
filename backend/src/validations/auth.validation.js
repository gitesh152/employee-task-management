import Joi from 'joi';

import { passwordRules as basePasswordRules } from './password.validation.js';

export const passwordRules = basePasswordRules.required().messages({
  'any.required': 'Password is required!',
});

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    department: Joi.string().trim().allow('').optional(),
    designation: Joi.string().trim().allow('').optional(),
    email: Joi.string().email().lowercase().trim().required(),
    password: passwordRules,
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirm password must match password!',
        'any.required': 'Confirm password is required!',
      }),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).required(),
    rememberMe: Joi.boolean().default(false),
  }),
});

export const refreshTokenSchema = Joi.object({
  cookies: Joi.object({
    refreshToken: Joi.string().trim().min(10).required().messages({
      'string.empty': 'Refresh token can not be empty!',
      'any.required': 'Refresh token missing in cookies!',
    }),
  }),
});
