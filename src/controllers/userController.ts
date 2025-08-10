import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

type SafeUser = Pick<IUser, 'name' | 'email' | 'currency' | 'timezone' | 'isVerified'> & {
  id: string;
  avatar?: string;
};

function toSafeUser(user: IUser): SafeUser {
  return {
    id: (user as any)._id?.toString?.() ?? (user as any).id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    timezone: user.timezone,
    isVerified: user.isVerified,
    avatar: (user as any).avatar,
  };
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = req.user as IUser | undefined;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Try to find an existing user; if not found (dev/mock), upsert one using current auth data
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
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = req.user as IUser | undefined;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, currency, timezone, avatar } = req.body as Partial<IUser> & { avatar?: string };

    const allowedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD', 'JPY', 'CNY'];
    if (currency && !allowedCurrencies.includes(currency)) {
      res.status(400).json({ success: false, message: 'Invalid currency' });
      return;
    }

    const update: Partial<IUser> & { avatar?: string } = {};
    if (typeof name === 'string') update.name = name.trim();
    if (typeof currency === 'string') update.currency = currency;
    if (typeof timezone === 'string') update.timezone = timezone;
    if (typeof avatar === 'string') (update as any).avatar = avatar;

    const user = await User.findByIdAndUpdate((authUser as any)._id, update, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: toSafeUser(user) },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};


