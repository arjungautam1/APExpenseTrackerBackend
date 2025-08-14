import express from 'express';
import { protect } from '../middleware/auth';
import { scanBill, autoCategorize, extractBulkTransactions } from '../controllers/aiController';

console.log('Loading AI routes...');

const router = express.Router();

router.use(protect);
router.post('/scan-bill', scanBill);
router.post('/auto-categorize', autoCategorize);
router.post('/extract-bulk-transactions', extractBulkTransactions);

console.log('AI routes loaded successfully');

export default router;


