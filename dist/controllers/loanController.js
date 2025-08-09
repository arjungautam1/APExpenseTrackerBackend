"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanSchedule = exports.deleteLoan = exports.updateLoan = exports.createLoan = exports.getLoan = exports.getLoans = void 0;
const Loan_1 = __importDefault(require("../models/Loan"));
const getLoans = async (req, res) => {
    try {
        const loans = await Loan_1.default.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: loans });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to get loans' });
    }
};
exports.getLoans = getLoans;
const getLoan = async (req, res) => {
    try {
        const loan = await Loan_1.default.findOne({ _id: req.params.id, userId: req.user?.id });
        if (!loan)
            return res.status(404).json({ success: false, message: 'Loan not found' });
        res.json({ success: true, data: loan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to get loan' });
    }
};
exports.getLoan = getLoan;
const createLoan = async (req, res) => {
    try {
        const { name, principalAmount, interestRate, startDate, endDate } = req.body;
        const loan = await Loan_1.default.create({
            userId: req.user?.id,
            name,
            principalAmount: parseFloat(principalAmount),
            currentBalance: parseFloat(principalAmount),
            interestRate: parseFloat(interestRate),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: 'active',
        });
        res.status(201).json({ success: true, message: 'Loan created successfully', data: loan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to create loan' });
    }
};
exports.createLoan = createLoan;
const updateLoan = async (req, res) => {
    try {
        const { name, principalAmount, currentBalance, interestRate, startDate, endDate, status } = req.body;
        const loan = await Loan_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, {
            ...(name && { name }),
            ...(principalAmount !== undefined && { principalAmount: parseFloat(principalAmount) }),
            ...(currentBalance !== undefined && { currentBalance: parseFloat(currentBalance) }),
            ...(interestRate !== undefined && { interestRate: parseFloat(interestRate) }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            ...(status && { status }),
        }, { new: true });
        if (!loan)
            return res.status(404).json({ success: false, message: 'Loan not found' });
        res.json({ success: true, message: 'Loan updated successfully', data: loan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to update loan' });
    }
};
exports.updateLoan = updateLoan;
const deleteLoan = async (req, res) => {
    try {
        const loan = await Loan_1.default.findOne({ _id: req.params.id, userId: req.user?.id });
        if (!loan)
            return res.status(404).json({ success: false, message: 'Loan not found' });
        await Loan_1.default.findByIdAndDelete(loan._id);
        res.json({ success: true, message: 'Loan deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to delete loan' });
    }
};
exports.deleteLoan = deleteLoan;
// Generate EMI schedule using standard formula
// EMI = P * r * (1+r)^n / ((1+r)^n - 1)
const getLoanSchedule = async (req, res) => {
    try {
        const loan = await Loan_1.default.findOne({ _id: req.params.id, userId: req.user?.id });
        if (!loan)
            return res.status(404).json({ success: false, message: 'Loan not found' });
        const months = Math.max(1, Math.ceil((loan.endDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const monthlyRate = loan.interestRate / 12 / 100;
        const P = loan.principalAmount;
        const n = months;
        const r = monthlyRate;
        const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const schedule = [];
        let balance = loan.principalAmount;
        let current = new Date(loan.startDate);
        for (let i = 1; i <= n; i++) {
            const interestPortion = balance * r;
            const principalPortion = Math.min(balance, emi - interestPortion);
            balance = Math.max(0, balance - principalPortion);
            const date = new Date(current);
            schedule.push({ installment: i, date, principal: principalPortion, interest: interestPortion, balance });
            current.setMonth(current.getMonth() + 1);
        }
        res.json({ success: true, data: { emi, months: n, schedule } });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to generate schedule' });
    }
};
exports.getLoanSchedule = getLoanSchedule;
//# sourceMappingURL=loanController.js.map