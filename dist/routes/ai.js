"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const aiController_1 = require("../controllers/aiController");
const router = express_1.default.Router();
router.use(auth_1.protect);
const scanBillValidation = [
    (0, express_validator_1.body)('imageBase64').optional().isString().withMessage('Image must be a base64 string'),
    (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
    validation_1.handleValidationErrors
];
const autoCategorizeValidation = [
    (0, express_validator_1.body)('description').isString().trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
    (0, express_validator_1.body)('merchant').optional().isString().trim().withMessage('Merchant must be a string'),
    validation_1.handleValidationErrors
];
const bulkExtractionValidation = [
    (0, express_validator_1.body)('imageBase64').isString().notEmpty().withMessage('Image base64 is required'),
    validation_1.handleValidationErrors
];
router.post('/scan-bill', scanBillValidation, aiController_1.scanBill);
router.post('/auto-categorize', autoCategorizeValidation, aiController_1.autoCategorize);
router.post('/extract-bulk-transactions', bulkExtractionValidation, aiController_1.extractBulkTransactions);
exports.default = router;
//# sourceMappingURL=ai.js.map