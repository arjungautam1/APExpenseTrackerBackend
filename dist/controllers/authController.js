"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.getMe = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, currency = 'USD', timezone = 'UTC' } = req.body;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            });
            return;
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password,
            currency,
            timezone
        });
        // Create mock tokens for development
        const token = 'mock-jwt-token';
        const refreshToken = 'mock-refresh-token';
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                    timezone: user.timezone,
                    isVerified: user.isVerified
                },
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate email & password
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }
        // Check for user (include password for comparison)
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Create mock tokens for development
        const token = 'mock-jwt-token';
        const refreshToken = 'mock-refresh-token';
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                    timezone: user.timezone,
                    isVerified: user.isVerified
                },
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};
exports.login = login;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
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
            res.status(400).json({
                success: false,
                message: 'Failed to create or find user'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id?.toString?.() ?? user.id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                    timezone: user.timezone,
                    isVerified: user.isVerified,
                    avatar: user.avatar,
                },
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get user data'
        });
    }
};
exports.getMe = getMe;
// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            });
            return;
        }
        // Verify refresh token
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        // Check if user still exists
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
            return;
        }
        // Generate mock tokens for development
        const newToken = 'mock-jwt-token';
        const newRefreshToken = 'mock-refresh-token';
        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};
exports.refreshToken = refreshToken;
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map