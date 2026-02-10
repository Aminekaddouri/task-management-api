import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation target (where to validate)
type ValidationSource = 'body' | 'query' | 'params';

// Custom validation error class
export class ValidationError extends Error {
  public readonly statusCode: number;
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.statusCode = 400;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation middleware factory
 * @param schema - Joi validation schema
 * @param source - Where to validate (body, query, params)
 */
export const validate = (schema: Joi.ObjectSchema, source: ValidationSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get data to validate based on source
    const dataToValidate = req[source];

    // Validate with Joi
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Collect all errors
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert values to correct types
    });

    // If validation fails
    if (error) {
      const errors: Record<string, string[]> = {};

      // Format errors
      error.details.forEach(detail => {
        const key = detail.path.join('.');
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(detail.message);
      });

      // Return validation error
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};
