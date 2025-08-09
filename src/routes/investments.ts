import express from 'express';
import { body, query } from 'express-validator';
import {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentStats
} from '../controllers/investmentController';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation middleware
const createInvestmentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Investment name is required')
    .isLength({ max: 100 })
    .withMessage('Investment name cannot exceed 100 characters'),
  body('type')
    .isIn(['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'])
    .withMessage('Type must be stocks, mutual_funds, crypto, real_estate, or other'),
  body('amountInvested')
    .isFloat({ min: 0 })
    .withMessage('Amount invested must be a positive number'),
  body('currentValue')
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  body('purchaseDate')
    .isISO8601()
    .withMessage('Purchase date must be a valid ISO 8601 date'),
  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('symbol')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Symbol cannot exceed 10 characters'),
  body('platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Platform name cannot exceed 50 characters'),
  handleValidationErrors
];

const updateInvestmentValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Investment name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Investment name cannot exceed 100 characters'),
  body('type')
    .optional()
    .isIn(['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'])
    .withMessage('Type must be stocks, mutual_funds, crypto, real_estate, or other'),
  body('amountInvested')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount invested must be a positive number'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid ISO 8601 date'),
  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('symbol')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Symbol cannot exceed 10 characters'),
  body('platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Platform name cannot exceed 50 characters'),
  handleValidationErrors
];

const getInvestmentsValidation = [
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
    .isIn(['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'])
    .withMessage('Type must be stocks, mutual_funds, crypto, real_estate, or other'),
  query('sortBy')
    .optional()
    .isIn(['name', 'type', 'amountInvested', 'currentValue', 'purchaseDate', 'createdAt'])
    .withMessage('SortBy must be a valid field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),
  handleValidationErrors
];

// Routes
router.get('/stats', getInvestmentStats);
router.get('/', getInvestmentsValidation, getInvestments);
router.get('/:id', getInvestment);
router.post('/', createInvestmentValidation, createInvestment);
router.put('/:id', updateInvestmentValidation, updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;