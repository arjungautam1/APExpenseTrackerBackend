"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const monthlyExpenseController_1 = require("../controllers/monthlyExpenseController");
const router = express_1.default.Router();
// Apply authentication middleware to all routes (temporarily disabled for testing)
// router.use(protect);
// Get all monthly expenses
router.get('/', monthlyExpenseController_1.getMonthlyExpenses);
// Get monthly expenses summary
router.get('/summary', monthlyExpenseController_1.getMonthlyExpensesSummary);
// Test endpoint to verify routes are loaded
router.get('/test', (req, res) => {
    console.log('Monthly expenses test endpoint called');
    res.json({ message: 'Monthly expenses routes are working!', timestamp: new Date().toISOString() });
});
// Get monthly expenses by category
router.get('/category/:category', monthlyExpenseController_1.getMonthlyExpensesByCategory);
// Create a new monthly expense
router.post('/', monthlyExpenseController_1.createMonthlyExpense);
// Update a monthly expense
router.put('/:id', monthlyExpenseController_1.updateMonthlyExpense);
// Delete a monthly expense
router.delete('/:id', monthlyExpenseController_1.deleteMonthlyExpense);
// Process payment for a monthly expense
router.post('/:id/pay', monthlyExpenseController_1.processMonthlyExpensePayment);
exports.default = router;
//# sourceMappingURL=monthlyExpenses.js.map