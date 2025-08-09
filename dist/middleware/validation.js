"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const extractedErrors = {};
        errors.array().forEach(err => {
            if ('path' in err) {
                extractedErrors[err.path] = err.msg;
            }
        });
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: extractedErrors
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
//# sourceMappingURL=validation.js.map