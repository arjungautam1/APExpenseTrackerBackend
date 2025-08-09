"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Investment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const investmentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Investment name is required'],
        trim: true,
        maxlength: [100, 'Investment name cannot exceed 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Investment type is required'],
        enum: {
            values: ['stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'],
            message: '{VALUE} is not a valid investment type'
        }
    },
    amountInvested: {
        type: Number,
        required: [true, 'Amount invested is required'],
        min: [0, 'Amount invested must be positive']
    },
    currentValue: {
        type: Number,
        required: [true, 'Current value is required'],
        min: [0, 'Current value must be positive']
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Purchase date is required']
    },
    quantity: {
        type: Number,
        min: [0, 'Quantity must be positive']
    },
    symbol: {
        type: String,
        trim: true,
        maxlength: [10, 'Symbol cannot exceed 10 characters']
    },
    platform: {
        type: String,
        trim: true,
        maxlength: [50, 'Platform name cannot exceed 50 characters']
    }
}, {
    timestamps: true
});
// Add indexes for better query performance
investmentSchema.index({ userId: 1, createdAt: -1 });
investmentSchema.index({ userId: 1, type: 1 });
// Virtual for gain/loss calculation
investmentSchema.virtual('gainLoss').get(function () {
    return this.currentValue - this.amountInvested;
});
investmentSchema.virtual('gainLossPercentage').get(function () {
    if (this.amountInvested === 0)
        return 0;
    return ((this.currentValue - this.amountInvested) / this.amountInvested) * 100;
});
// Ensure virtual fields are serialized
investmentSchema.set('toJSON', { virtuals: true });
exports.Investment = mongoose_1.default.model('Investment', investmentSchema);
//# sourceMappingURL=Investment.js.map