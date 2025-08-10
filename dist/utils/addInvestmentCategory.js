"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInvestmentCategory = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const addInvestmentCategory = async () => {
    try {
        // Check if Investment category already exists
        const existingCategory = await Category_1.default.findOne({
            name: 'Investment',
            type: 'expense',
            isDefault: true
        });
        if (existingCategory) {
            console.log('Investment category already exists');
            return;
        }
        // Create the Investment category
        const investmentCategory = {
            name: 'Investment',
            type: 'expense',
            icon: 'trending-up',
            color: '#6366F1',
            isDefault: true
        };
        await Category_1.default.create(investmentCategory);
        console.log('Investment category added successfully');
    }
    catch (error) {
        console.error('Error adding Investment category:', error);
    }
};
exports.addInvestmentCategory = addInvestmentCategory;
//# sourceMappingURL=addInvestmentCategory.js.map