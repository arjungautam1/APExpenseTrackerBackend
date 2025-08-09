"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const protect = async (req, res, next) => {
    // Temporarily bypass JWT authentication
    // TODO: Re-enable JWT authentication later
    // Create a mock user for development with a valid ObjectId
    const mockUser = {
        _id: new mongoose_1.default.Types.ObjectId('64a7b8c8d3e4f5a6b7c8d9e0'),
        id: '64a7b8c8d3e4f5a6b7c8d9e0',
        name: 'Test User',
        email: 'test@example.com',
        currency: 'USD',
        timezone: 'UTC',
        isVerified: true
    };
    req.user = mockUser;
    next();
};
exports.protect = protect;
//# sourceMappingURL=auth.js.map