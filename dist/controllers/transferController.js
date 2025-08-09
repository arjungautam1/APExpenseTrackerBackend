"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransfer = exports.updateTransfer = exports.createTransfer = exports.getTransfer = exports.getTransfers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Transfer_1 = __importDefault(require("../models/Transfer"));
const getTransfers = async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const status = req.query.status;
        const query = { userId: req.user?.id };
        if (status && ['pending', 'completed', 'failed'].includes(status)) {
            query.status = status;
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Transfer_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Transfer_1.default.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to get transfers' });
    }
};
exports.getTransfers = getTransfers;
const getTransfer = async (req, res) => {
    try {
        const item = await Transfer_1.default.findOne({ _id: req.params.id, userId: req.user?.id });
        if (!item)
            return res.status(404).json({ success: false, message: 'Transfer not found' });
        res.json({ success: true, data: item });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to get transfer' });
    }
};
exports.getTransfer = getTransfer;
const createTransfer = async (req, res) => {
    try {
        const { recipientName, amount, purpose, destinationCountry, transferMethod, fees, exchangeRate, status, transactionId, } = req.body;
        const transfer = await Transfer_1.default.create({
            userId: req.user?.id,
            recipientName,
            amount: parseFloat(amount),
            purpose,
            destinationCountry: String(destinationCountry).toUpperCase(),
            transferMethod,
            fees: parseFloat(fees),
            exchangeRate: exchangeRate !== undefined ? parseFloat(exchangeRate) : undefined,
            status: status || 'pending',
            transactionId: transactionId && mongoose_1.default.Types.ObjectId.isValid(transactionId) ? transactionId : undefined,
        });
        res.status(201).json({ success: true, message: 'Transfer created successfully', data: transfer });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to create transfer' });
    }
};
exports.createTransfer = createTransfer;
const updateTransfer = async (req, res) => {
    try {
        const update = {};
        const fields = [
            'recipientName',
            'amount',
            'purpose',
            'destinationCountry',
            'transferMethod',
            'fees',
            'exchangeRate',
            'status',
            'transactionId',
        ];
        for (const key of fields) {
            if (req.body[key] !== undefined)
                update[key] = req.body[key];
        }
        if (update.amount !== undefined)
            update.amount = parseFloat(update.amount);
        if (update.fees !== undefined)
            update.fees = parseFloat(update.fees);
        if (update.exchangeRate !== undefined)
            update.exchangeRate = parseFloat(update.exchangeRate);
        if (update.destinationCountry)
            update.destinationCountry = String(update.destinationCountry).toUpperCase();
        if (update.transactionId && !mongoose_1.default.Types.ObjectId.isValid(update.transactionId))
            delete update.transactionId;
        const item = await Transfer_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, update, { new: true, runValidators: true });
        if (!item)
            return res.status(404).json({ success: false, message: 'Transfer not found' });
        res.json({ success: true, message: 'Transfer updated successfully', data: item });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to update transfer' });
    }
};
exports.updateTransfer = updateTransfer;
const deleteTransfer = async (req, res) => {
    try {
        const item = await Transfer_1.default.findOne({ _id: req.params.id, userId: req.user?.id });
        if (!item)
            return res.status(404).json({ success: false, message: 'Transfer not found' });
        await Transfer_1.default.findByIdAndDelete(item._id);
        res.json({ success: true, message: 'Transfer deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to delete transfer' });
    }
};
exports.deleteTransfer = deleteTransfer;
//# sourceMappingURL=transferController.js.map