"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const transferController_1 = require("../controllers/transferController");
const router = express_1.default.Router();
router.use(auth_1.protect);
const listValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
    validation_1.handleValidationErrors,
];
const createValidation = [
    (0, express_validator_1.body)('recipientName').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Recipient name is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    (0, express_validator_1.body)('purpose').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Purpose is required'),
    (0, express_validator_1.body)('destinationCountry').isString().trim().isLength({ min: 2, max: 2 }).withMessage('Destination country must be ISO 3166-1 alpha-2'),
    (0, express_validator_1.body)('transferMethod').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Transfer method is required'),
    (0, express_validator_1.body)('fees').isFloat({ min: 0 }).withMessage('Fees must be positive'),
    (0, express_validator_1.body)('exchangeRate').optional().isFloat({ min: 0 }).withMessage('Exchange rate must be positive'),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('transactionId').optional().isMongoId().withMessage('Invalid transactionId'),
    validation_1.handleValidationErrors,
];
const updateValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid id'),
    (0, express_validator_1.body)('recipientName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('amount').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('purpose').optional().isString().trim().isLength({ min: 1, max: 200 }),
    (0, express_validator_1.body)('destinationCountry').optional().isString().trim().isLength({ min: 2, max: 2 }),
    (0, express_validator_1.body)('transferMethod').optional().isString().trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('fees').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('exchangeRate').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'completed', 'failed']),
    (0, express_validator_1.body)('transactionId').optional().isMongoId(),
    validation_1.handleValidationErrors,
];
router.get('/', listValidation, transferController_1.getTransfers);
router.get('/:id', transferController_1.getTransfer);
router.post('/', createValidation, transferController_1.createTransfer);
router.put('/:id', updateValidation, transferController_1.updateTransfer);
router.delete('/:id', [(0, express_validator_1.param)('id').isMongoId(), validation_1.handleValidationErrors], transferController_1.deleteTransfer);
exports.default = router;
//# sourceMappingURL=transfers.js.map