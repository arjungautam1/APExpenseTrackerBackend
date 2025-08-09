import express from 'express';
import { body, query } from 'express-validator';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getExpenseBreakdown
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation middleware
const createTransactionValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense', 'transfer'])
    .withMessage('Type must be income, expense, or transfer'),
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be valid'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  handleValidationErrors
];

const updateTransactionValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .optional()
    .isIn(['income', 'expense', 'transfer'])
    .withMessage('Type must be income, expense, or transfer'),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be valid'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  handleValidationErrors
];

const getTransactionsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['income', 'expense', 'transfer'])
    .withMessage('Type must be income, expense, or transfer'),
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be valid'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors
];

// Routes
router.get('/stats', getTransactionStats);
router.get('/expense-breakdown', getExpenseBreakdown);
router.get('/', getTransactionsValidation, getTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransactionValidation, createTransaction);
router.put('/:id', updateTransactionValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;