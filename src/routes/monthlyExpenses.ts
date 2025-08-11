import express from 'express';
import { protect } from '../middleware/auth';
import {
  getMonthlyExpenses,
  getMonthlyExpensesByCategory,
  createMonthlyExpense,
  updateMonthlyExpense,
  deleteMonthlyExpense,
  processMonthlyExpensePayment,
  getMonthlyExpensesSummary
} from '../controllers/monthlyExpenseController';

const router = express.Router();

// Apply authentication middleware to all routes (temporarily disabled for testing)
// router.use(protect);

// Get all monthly expenses
router.get('/', getMonthlyExpenses);

// Get monthly expenses summary
router.get('/summary', getMonthlyExpensesSummary);

// Test endpoint to verify routes are loaded
router.get('/test', (req, res) => {
  console.log('Monthly expenses test endpoint called');
  res.json({ message: 'Monthly expenses routes are working!', timestamp: new Date().toISOString() });
});

// Get monthly expenses by category
router.get('/category/:category', getMonthlyExpensesByCategory);

// Create a new monthly expense
router.post('/', createMonthlyExpense);

// Update a monthly expense
router.put('/:id', updateMonthlyExpense);

// Delete a monthly expense
router.delete('/:id', deleteMonthlyExpense);

// Process payment for a monthly expense
router.post('/:id/pay', processMonthlyExpensePayment);

export default router;
