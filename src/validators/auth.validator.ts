import Joi from 'joi';
import { emailSchema, passwordSchema, usernameSchema } from './common.validator';

/**
 * User registration validation
 */
export const registerSchema = Joi.object({
  email: emailSchema.required(),
  username: usernameSchema.required(),
  password: passwordSchema.required(),
  firstName: Joi.string().min(1).max(50).trim().optional().allow(''),
  lastName: Joi.string().min(1).max(50).trim().optional().allow(''),
});

/**
 * User login validation
 */
export const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

/**
 * Update profile validation
 */
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).trim().optional(),
  lastName: Joi.string().min(1).max(50).trim().optional(),
  avatar: Joi.string().uri().optional().allow(''),
});

/**
 * Change password validation
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: passwordSchema.required(),
});

/**
 * Password reset request validation
 */
export const forgotPasswordSchema = Joi.object({
  email: emailSchema.required(),
});

/**
 * Password reset validation
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
  }),
  password: passwordSchema.required(),
});