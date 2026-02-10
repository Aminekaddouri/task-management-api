import Joi from 'joi';

/**
 * Common validation patterns
 */

// UUID validation
export const uuidSchema = Joi.string()
  .uuid()
  .messages({
    'string.guid': 'Invalid ID format',
  });

// Email validation
export const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  });

// Password validation (strong password)
export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'string.empty': 'Password is required',
  });

// Username validation
export const usernameSchema = Joi.string()
  .alphanum()
  .min(3)
  .max(30)
  .lowercase()
  .trim()
  .messages({
    'string.alphanum': 'Username must contain only letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters',
    'string.empty': 'Username is required',
  });

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('asc'),
});

// ID param validation
export const idParamSchema = Joi.object({
  id: uuidSchema.required(),
});