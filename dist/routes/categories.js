"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// Validation middleware
const createCategoryValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),
    (0, express_validator_1.body)('icon')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Icon must be between 1 and 30 characters'),
    (0, express_validator_1.body)('color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Color must be a valid hex color'),
    (0, express_validator_1.body)('parentCategoryId')
        .optional()
        .isMongoId()
        .withMessage('Parent category ID must be valid'),
    validation_1.handleValidationErrors
];
const updateCategoryValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('icon')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Icon must be between 1 and 30 characters'),
    (0, express_validator_1.body)('color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Color must be a valid hex color'),
    (0, express_validator_1.body)('parentCategoryId')
        .optional()
        .isMongoId()
        .withMessage('Parent category ID must be valid'),
    validation_1.handleValidationErrors
];
const getCategoriesValidation = [
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),
    validation_1.handleValidationErrors
];
// Routes
router.get('/', getCategoriesValidation, categoryController_1.getCategories);
router.get('/:id', categoryController_1.getCategory);
router.post('/', createCategoryValidation, categoryController_1.createCategory);
router.put('/:id', updateCategoryValidation, categoryController_1.updateCategory);
router.delete('/:id', categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.js.map