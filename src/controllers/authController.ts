import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { verifyRefreshToken } from '../utils/jwt';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, currency = 'USD', timezone = 'UTC' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists'
      });
      return;
    }

    // Create user
    const user = await User.create({
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
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
    const user = await User.findOne({ email }).select('+password');

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = req.user as IUser | undefined;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let user = await User.findById((authUser as any)._id);

    if (!user) {
      user = await User.findOneAndUpdate(
        { _id: (authUser as any)._id },
        {
          $setOnInsert: {
            name: authUser.name || 'User',
            email: authUser.email || 'user@example.com',
            password: 'TempPass1!',
            currency: authUser.currency || 'USD',
            timezone: authUser.timezone || 'UTC',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json({
      success: true,
      data: {
        user: {
          id: (user as any)._id?.toString?.() ?? (user as any).id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          timezone: user.timezone,
          isVerified: user.isVerified,
          avatar: (user as any).avatar,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get user data'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
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
    const decoded = verifyRefreshToken(token);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
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
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};