import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, refreshToken, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD', 'JPY', 'CNY'])
    .withMessage('Invalid currency'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  handleValidationErrors
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshTokenValidation, refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;