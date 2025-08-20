import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { 
  scanBill, 
  autoCategorize, 
  extractBulkTransactions 
} from '../controllers/aiController';

const router = express.Router();

router.use(protect);

const scanBillValidation = [
  body('imageBase64').optional().isString().withMessage('Image must be a base64 string'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
  handleValidationErrors
];

const autoCategorizeValidation = [
  body('description').isString().trim().notEmpty().withMessage('Description is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('merchant').optional().isString().trim().withMessage('Merchant must be a string'),
  handleValidationErrors
];

const bulkExtractionValidation = [
  body('imageBase64').isString().notEmpty().withMessage('Image base64 is required'),
  handleValidationErrors
];

router.post('/scan-bill', scanBillValidation, scanBill);
router.post('/auto-categorize', autoCategorizeValidation, autoCategorize);
router.post('/extract-bulk-transactions', bulkExtractionValidation, extractBulkTransactions);

export default router;


