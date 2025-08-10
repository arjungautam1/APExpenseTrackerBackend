"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fixTransactionCategories_1 = require("../utils/fixTransactionCategories");
async function main() {
    try {
        console.log('Connecting to database...');
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
        console.log('Database connected.');
        await (0, fixTransactionCategories_1.fixTransactionCategories)();
        console.log('Migration completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runCategoryFix.js.map