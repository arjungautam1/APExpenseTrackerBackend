"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const loanController_1 = require("../controllers/loanController");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', loanController_1.getLoans);
router.get('/:id', loanController_1.getLoan);
router.get('/:id/schedule', loanController_1.getLoanSchedule);
router.post('/', [
    (0, express_validator_1.body)('name').isString().isLength({ min: 1 }).withMessage('Name is required'),
    (0, express_validator_1.body)('principalAmount').isFloat({ min: 0 }).withMessage('Principal must be positive'),
    (0, express_validator_1.body)('interestRate').isFloat({ min: 0 }).withMessage('Interest rate must be positive'),
    (0, express_validator_1.body)('startDate').isISO8601().withMessage('Start date must be valid'),
    (0, express_validator_1.body)('endDate').isISO8601().withMessage('End date must be valid'),
    validation_1.handleValidationErrors,
], loanController_1.createLoan);
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid id'),
    validation_1.handleValidationErrors,
], loanController_1.updateLoan);
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid id'),
    validation_1.handleValidationErrors,
], loanController_1.deleteLoan);
exports.default = router;
//# sourceMappingURL=loans.js.map