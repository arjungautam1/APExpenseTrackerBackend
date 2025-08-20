"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const monthlyExpenseController_1 = require("../controllers/monthlyExpenseController");
const router = express_1.default.Router();
router.use(auth_1.protect);
const createValidation = [
    (0, express_validator_1.body)('name').isString().trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    (0, express_validator_1.body)('dueDate').isInt({ min: 1, max: 31 }).withMessage('Due date must be between 1 and 31'),
    (0, express_validator_1.body)('category').isString().trim().notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('description').optional().isString().trim().withMessage('Description must be a string'),
    (0, express_validator_1.body)('autoDeduct').optional().isBoolean().withMessage('Auto deduct must be a boolean'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    validation_1.handleValidationErrors
];
const updateValidation = [
    (0, express_validator_1.body)('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
    (0, express_validator_1.body)('dueDate').optional().isInt({ min: 1, max: 31 }).withMessage('Due date must be between 1 and 31'),
    (0, express_validator_1.body)('category').optional().isString().trim().notEmpty().withMessage('Category cannot be empty'),
    (0, express_validator_1.body)('description').optional().isString().trim().withMessage('Description must be a string'),
    (0, express_validator_1.body)('autoDeduct').optional().isBoolean().withMessage('Auto deduct must be a boolean'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    validation_1.handleValidationErrors
];
const listValidation = [
    (0, express_validator_1.query)('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    (0, express_validator_1.query)('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
    (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('Is active must be a boolean'),
    validation_1.handleValidationErrors
];
router.get('/test', (req, res) => {
    res.json({ message: 'Monthly expenses test endpoint working' });
});
router.get('/', listValidation, monthlyExpenseController_1.getMonthlyExpenses);
router.get('/stats', monthlyExpenseController_1.getMonthlyExpenseStats);
router.post('/', createValidation, monthlyExpenseController_1.createMonthlyExpense);
router.put('/:id', updateValidation, monthlyExpenseController_1.updateMonthlyExpense);
router.delete('/:id', monthlyExpenseController_1.deleteMonthlyExpense);
router.patch('/:id/paid', monthlyExpenseController_1.markAsPaid);
router.patch('/:id/unpaid', monthlyExpenseController_1.markAsUnpaid);
exports.default = router;
//# sourceMappingURL=monthlyExpenses.js.map