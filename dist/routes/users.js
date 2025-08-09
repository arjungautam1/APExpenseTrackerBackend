"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.protect);
const updateValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('currency')
        .optional()
        .isIn(['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD', 'JPY', 'CNY'])
        .withMessage('Invalid currency'),
    (0, express_validator_1.body)('timezone')
        .optional()
        .isString()
        .isLength({ min: 1, max: 100 })
        .withMessage('Timezone is required'),
    (0, express_validator_1.body)('avatar')
        .optional()
        .isString()
        .withMessage('Avatar must be a base64 or URL string'),
    validation_1.handleValidationErrors,
];
router.get('/me', userController_1.getProfile);
router.put('/me', updateValidation, userController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=users.js.map