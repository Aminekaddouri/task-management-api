import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validation';
import { registerSchema } from '../validators/auth.validator';
import { paginationSchema } from '../validators/common.validator';

const router = Router();

/**
 * Test validation endpoint - demonstrates how validation works
 * This is just for testing - will be removed when we add real auth
 */
router.post('/validate-test', validate(registerSchema, 'body'), (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Validation passed!',
    data: req.body,
  });
});

/**
 * Test pagination validation
 */
router.get(
  '/pagination-test',
  validate(paginationSchema, 'query'),
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Pagination parameters are valid',
      data: req.query,
    });
  }
);

export default router;
