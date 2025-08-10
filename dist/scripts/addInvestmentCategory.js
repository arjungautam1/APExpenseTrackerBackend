"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addInvestmentCategory_1 = require("../utils/addInvestmentCategory");
// Load environment variables
require('dotenv').config();
const runScript = async () => {
    try {
        // Connect to database
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Add Investment category
        await (0, addInvestmentCategory_1.addInvestmentCategory)();
        console.log('Script completed successfully');
    }
    catch (error) {
        console.error('Script failed:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};
runScript();
//# sourceMappingURL=addInvestmentCategory.js.map