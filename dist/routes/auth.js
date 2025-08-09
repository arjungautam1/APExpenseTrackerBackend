"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Validation middleware
const registerValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('currency')
        .optional()
        .isIn(['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD', 'JPY', 'CNY'])
        .withMessage('Invalid currency'),
    validation_1.handleValidationErrors
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    validation_1.handleValidationErrors
];
const refreshTokenValidation = [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
    validation_1.handleValidationErrors
];
// Routes
router.post('/register', registerValidation, authController_1.register);
router.post('/login', loginValidation, authController_1.login);
router.post('/refresh', refreshTokenValidation, authController_1.refreshToken);
router.post('/logout', authController_1.logout);
router.get('/me', auth_1.protect, authController_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map