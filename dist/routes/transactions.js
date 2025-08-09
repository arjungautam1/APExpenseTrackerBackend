"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const transactionController_1 = require("../controllers/transactionController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// Validation middleware
const createTransactionValidation = [
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('type')
        .isIn(['income', 'expense', 'transfer'])
        .withMessage('Type must be income, expense, or transfer'),
    (0, express_validator_1.body)('categoryId')
        .isMongoId()
        .withMessage('Category ID must be valid'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Description must be between 1 and 200 characters'),
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage('Each tag cannot exceed 30 characters'),
    validation_1.handleValidationErrors
];
const updateTransactionValidation = [
    (0, express_validator_1.body)('amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['income', 'expense', 'transfer'])
        .withMessage('Type must be income, expense, or transfer'),
    (0, express_validator_1.body)('categoryId')
        .optional()
        .isMongoId()
        .withMessage('Category ID must be valid'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Description must be between 1 and 200 characters'),
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage('Each tag cannot exceed 30 characters'),
    validation_1.handleValidationErrors
];
const getTransactionsValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['income', 'expense', 'transfer'])
        .withMessage('Type must be income, expense, or transfer'),
    (0, express_validator_1.query)('categoryId')
        .optional()
        .isMongoId()
        .withMessage('Category ID must be valid'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
    validation_1.handleValidationErrors
];
// Routes
router.get('/stats', transactionController_1.getTransactionStats);
router.get('/expense-breakdown', transactionController_1.getExpenseBreakdown);
router.get('/', getTransactionsValidation, transactionController_1.getTransactions);
router.get('/:id', transactionController_1.getTransaction);
router.post('/', createTransactionValidation, transactionController_1.createTransaction);
router.put('/:id', updateTransactionValidation, transactionController_1.updateTransaction);
router.delete('/:id', transactionController_1.deleteTransaction);
exports.default = router;
//# sourceMappingURL=transactions.js.map