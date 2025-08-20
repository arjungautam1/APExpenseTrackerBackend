import express from 'express';
import { body, query } from 'express-validator';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { 
  getMonthlyExpenses, 
  createMonthlyExpense, 
  updateMonthlyExpense, 
  deleteMonthlyExpense,
  getMonthlyExpenseStats,
  markAsPaid,
  markAsUnpaid
} from '../controllers/monthlyExpenseController';

const router = express.Router();

router.use(protect);

const createValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('dueDate').isInt({ min: 1, max: 31 }).withMessage('Due date must be between 1 and 31'),
  body('category').isString().trim().notEmpty().withMessage('Category is required'),
  body('description').optional().isString().trim().withMessage('Description must be a string'),
  body('autoDeduct').optional().isBoolean().withMessage('Auto deduct must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

const updateValidation = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('dueDate').optional().isInt({ min: 1, max: 31 }).withMessage('Due date must be between 1 and 31'),
  body('category').optional().isString().trim().notEmpty().withMessage('Category cannot be empty'),
  body('description').optional().isString().trim().withMessage('Description must be a string'),
  body('autoDeduct').optional().isBoolean().withMessage('Auto deduct must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

const listValidation = [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  query('isActive').optional().isBoolean().withMessage('Is active must be a boolean'),
  handleValidationErrors
];

router.get('/test', (req, res) => {
  res.json({ message: 'Monthly expenses test endpoint working' });
});

router.get('/', listValidation, getMonthlyExpenses);
router.get('/stats', getMonthlyExpenseStats);
router.post('/', createValidation, createMonthlyExpense);
router.put('/:id', updateValidation, updateMonthlyExpense);
router.delete('/:id', deleteMonthlyExpense);
router.patch('/:id/paid', markAsPaid);
router.patch('/:id/unpaid', markAsUnpaid);

export default router;
