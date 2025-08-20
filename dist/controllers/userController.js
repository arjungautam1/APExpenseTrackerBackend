"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
function toSafeUser(user) {
    return {
        id: user._id?.toString?.() ?? user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        isVerified: user.isVerified,
        avatar: user.avatar,
    };
}
const getProfile = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        // Try to find an existing user; if not found (dev/mock), upsert one using current auth data
        let user = await User_1.default.findById(authUser._id);
        if (!user) {
            user = await User_1.default.findOneAndUpdate({ _id: authUser._id }, {
                $setOnInsert: {
                    name: authUser.name || 'User',
                    email: authUser.email || 'user@example.com',
                    password: 'TempPass1!',
                    currency: authUser.currency || 'USD',
                    timezone: authUser.timezone || 'UTC',
                },
            }, { upsert: true, new: true, setDefaultsOnInsert: true });
        }
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Profile fetched successfully',
            data: { user: toSafeUser(user) },
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to fetch profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const { name, currency, timezone, avatar } = req.body;
        console.log('Updating profile for user:', authUser._id);
        console.log('Update data:', { name, currency, timezone, avatar });
        const allowedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD', 'JPY', 'CNY'];
        if (currency && !allowedCurrencies.includes(currency)) {
            res.status(400).json({ success: false, message: 'Invalid currency' });
            return;
        }
        const update = {};
        if (typeof name === 'string')
            update.name = name.trim();
        if (typeof currency === 'string')
            update.currency = currency;
        if (typeof timezone === 'string')
            update.timezone = timezone;
        if (typeof avatar === 'string')
            update.avatar = avatar;
        console.log('Final update object:', update);
        const user = await User_1.default.findByIdAndUpdate(authUser._id, update, {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        console.log('Updated user:', {
            id: user._id,
            name: user.name,
            currency: user.currency,
            timezone: user.timezone
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: toSafeUser(user) },
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=userController.js.map