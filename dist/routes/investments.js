"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const investmentController_1 = require("../controllers/investmentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// Validation middleware
const createInvestmentValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Investment name is required')
        .isLength({ max: 100 })
        .withMessage('Investment name cannot exceed 100 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'])
        .withMessage('Type must be stocks, mutual_funds, crypto, real_estate, or other'),
    (0, express_validator_1.body)('amountInvested')
        .isFloat({ min: 0 })
        .withMessage('Amount invested must be a positive number'),
    (0, express_validator_1.body)('currentValue')
        .isFloat({ min: 0 })
        .withMessage('Current value must be a positive number'),
    (0, express_validator_1.body)('purchaseDate')
        .isISO8601()
        .withMessage('Purchase date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('quantity')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Quantity must be a positive number'),
    (0, express_validator_1.body)('symbol')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('Symbol cannot exceed 10 characters'),
    (0, express_validator_1.body)('platform')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Platform name cannot exceed 50 characters'),
    validation_1.handleValidationErrors
];
const updateInvestmentValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Investment name cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Investment name cannot exceed 100 characters'),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'])
        .withMessage('Type must be stocks, mutual_funds, crypto, real_estate, or other'),
    (0, express_validator_1.body)('amountInvested')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount invested must be a positive number'),
    (0, express_validator_1.body)('currentValue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Current value must be a positive number'),
    (0, express_validator_1.body)('purchaseDate')
        .optional()
        .isISO8601()
        .withMessage('Purchase date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('quantity')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Quantity must be a positive number'),
    (0, express_validator_1.body)('symbol')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('Symbol cannot exceed 10 characters'),
    (0, express_validator_1.body)('platform')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Platform name cannot exceed 50 characters'),
    validation_1.handleValidationErrors
];
const getInvestmentsValidation = [
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
        .isIn(['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'])
        .withMessage('Type must be stocks, mutual_funds, crypto, real_estate, or other'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['name', 'type', 'amountInvested', 'currentValue', 'purchaseDate', 'createdAt'])
        .withMessage('SortBy must be a valid field'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('SortOrder must be asc or desc'),
    validation_1.handleValidationErrors
];
// Routes
router.get('/stats', investmentController_1.getInvestmentStats);
router.get('/', getInvestmentsValidation, investmentController_1.getInvestments);
router.get('/:id', investmentController_1.getInvestment);
router.post('/', createInvestmentValidation, investmentController_1.createInvestment);
router.put('/:id', updateInvestmentValidation, investmentController_1.updateInvestment);
router.delete('/:id', investmentController_1.deleteInvestment);
exports.default = router;
//# sourceMappingURL=investments.js.map