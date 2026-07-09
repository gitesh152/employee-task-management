import Joi from 'joi';

export const passwordRules = Joi.string()
  .min(8)
  .max(108)
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/\d/, 'digit')
  .pattern(/[^A-Za-z0-9]/, 'symbol')
  .messages({
    'string.min': 'Password must be atleast 8 characters long!',
    'string.pattern.name': 'Password must include at least one {#name}!',
  });
