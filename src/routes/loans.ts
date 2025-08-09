import express from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { getLoans, getLoan, createLoan, updateLoan, deleteLoan, getLoanSchedule } from '../controllers/loanController';

const router = express.Router();

router.use(protect);

router.get('/', getLoans);
router.get('/:id', getLoan);
router.get('/:id/schedule', getLoanSchedule);

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('principalAmount').isFloat({ min: 0 }).withMessage('Principal must be positive'),
    body('interestRate').isFloat({ min: 0 }).withMessage('Interest rate must be positive'),
    body('startDate').isISO8601().withMessage('Start date must be valid'),
    body('endDate').isISO8601().withMessage('End date must be valid'),
    handleValidationErrors,
  ],
  createLoan
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid id'),
    handleValidationErrors,
  ],
  updateLoan
);

router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid id'),
    handleValidationErrors,
  ],
  deleteLoan
);

export default router;


