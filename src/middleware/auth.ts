import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Temporarily bypass JWT authentication
  // TODO: Re-enable JWT authentication later
  
  // Create a mock user for development with a valid ObjectId
  const mockUser = {
    _id: new mongoose.Types.ObjectId('64a7b8c8d3e4f5a6b7c8d9e0'),
    id: '64a7b8c8d3e4f5a6b7c8d9e0',
    name: 'Test User',
    email: 'test@example.com',
    currency: 'USD',
    timezone: 'UTC',
    isVerified: true
  } as IUser;
  
  req.user = mockUser;
  next();
};

// Declare the AuthenticatedRequest type for use in other files
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}