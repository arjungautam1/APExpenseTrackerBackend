import express from 'express';
import { body, query } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation middleware
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('type')
    .isIn(['income', 'expense', 'investment'])
    .withMessage('Type must be income, expense, or investment'),
  body('icon')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Icon must be between 1 and 30 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('parentCategoryId')
    .optional()
    .isMongoId()
    .withMessage('Parent category ID must be valid'),
  handleValidationErrors
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Icon must be between 1 and 30 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('parentCategoryId')
    .optional()
    .isMongoId()
    .withMessage('Parent category ID must be valid'),
  handleValidationErrors
];

const getCategoriesValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense', 'investment'])
    .withMessage('Type must be income, expense, or investment'),
  handleValidationErrors
];

// Routes
router.get('/', getCategoriesValidation, getCategories);
router.get('/:id', getCategory);
router.post('/', createCategoryValidation, createCategory);
router.put('/:id', updateCategoryValidation, updateCategory);
router.delete('/:id', deleteCategory);

export default router;