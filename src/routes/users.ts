import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router.use(protect);

const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD', 'JPY', 'CNY'])
    .withMessage('Invalid currency'),
  body('timezone')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Timezone is required'),
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a base64 or URL string'),
  handleValidationErrors,
];

router.get('/me', getProfile);
router.put('/me', updateValidation, updateProfile);

export default router;


