import express from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { getTransfers, getTransfer, createTransfer, updateTransfer, deleteTransfer } from '../controllers/transferController';

const router = express.Router();

router.use(protect);

const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
  handleValidationErrors,
];

const createValidation = [
  body('recipientName').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Recipient name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('purpose').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Purpose is required'),
  body('destinationCountry').isString().trim().isLength({ min: 2, max: 2 }).withMessage('Destination country must be ISO 3166-1 alpha-2'),
  body('transferMethod').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Transfer method is required'),
  body('fees').isFloat({ min: 0 }).withMessage('Fees must be positive'),
  body('exchangeRate').optional().isFloat({ min: 0 }).withMessage('Exchange rate must be positive'),
  body('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
  body('transactionId').optional().isMongoId().withMessage('Invalid transactionId'),
  handleValidationErrors,
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid id'),
  body('recipientName').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('amount').optional().isFloat({ min: 0 }),
  body('purpose').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('destinationCountry').optional().isString().trim().isLength({ min: 2, max: 2 }),
  body('transferMethod').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('fees').optional().isFloat({ min: 0 }),
  body('exchangeRate').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'completed', 'failed']),
  body('transactionId').optional().isMongoId(),
  handleValidationErrors,
];

router.get('/', listValidation, getTransfers);
router.get('/:id', getTransfer);
router.post('/', createValidation, createTransfer);
router.put('/:id', updateValidation, updateTransfer);
router.delete('/:id', [param('id').isMongoId(), handleValidationErrors], deleteTransfer);

export default router;












