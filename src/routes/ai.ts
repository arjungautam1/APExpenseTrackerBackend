import express from 'express';
import { protect } from '../middleware/auth';
import { scanBill } from '../controllers/aiController';

const router = express.Router();

router.use(protect);
router.post('/scan-bill', scanBill);

export default router;


