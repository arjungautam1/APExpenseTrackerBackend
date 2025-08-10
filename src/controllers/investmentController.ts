import { Request, Response } from 'express';
import { Investment } from '../models/Investment';
import mongoose from 'mongoose';

// Get all investments for a user
export const getInvestments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      page = 1, 
      limit = 10, 
      type, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const query: any = { userId };
    
    if (type) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Investment.countDocuments(query)
    ]);

    // Calculate virtual fields manually for lean queries
    const investmentsWithCalculations = investments.map(investment => ({
      ...investment,
      gainLoss: investment.currentValue ? investment.currentValue - investment.amountInvested : 0,
      gainLossPercentage: investment.currentValue && investment.amountInvested > 0
        ? ((investment.currentValue - investment.amountInvested) / investment.amountInvested) * 100
        : 0
    }));

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    };

    res.status(200).json({
      success: true,
      message: 'Investments retrieved successfully',
      data: investmentsWithCalculations,
      pagination
    });
  } catch (error: any) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve investments',
      error: error.message
    });
  }
};

// Get single investment
export const getInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment ID'
      });
    }

    const investment = await Investment.findOne({ _id: id, userId }).lean();

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Calculate virtual fields manually
    const investmentWithCalculations = {
      ...investment,
      gainLoss: investment.currentValue ? investment.currentValue - investment.amountInvested : 0,
      gainLossPercentage: investment.currentValue && investment.amountInvested > 0
        ? ((investment.currentValue - investment.amountInvested) / investment.amountInvested) * 100
        : 0
    };

    res.status(200).json({
      success: true,
      message: 'Investment retrieved successfully',
      data: investmentWithCalculations
    });
  } catch (error: any) {
    console.error('Get investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve investment',
      error: error.message
    });
  }
};

// Create new investment
export const createInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Debug logging
    console.log('=== Investment Creation Debug ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('currentValue specifically:', req.body.currentValue);
    console.log('currentValue type:', typeof req.body.currentValue);
    console.log('===============================');
    
    const {
      name,
      type,
      amountInvested,
      currentValue,
      purchaseDate,
      quantity,
      symbol,
      platform
    } = req.body;

    const investment = new Investment({
      userId,
      name,
      type,
      amountInvested,
      currentValue,
      purchaseDate,
      quantity,
      symbol,
      platform
    });

    await investment.save();

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment
    });
  } catch (error: any) {
    console.error('Create investment error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors: any = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create investment',
      error: error.message
    });
  }
};

// Update investment
export const updateInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment ID'
      });
    }

    const investment = await Investment.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Investment updated successfully',
      data: investment
    });
  } catch (error: any) {
    console.error('Update investment error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors: any = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update investment',
      error: error.message
    });
  }
};

// Delete investment
export const deleteInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment ID'
      });
    }

    const investment = await Investment.findOneAndDelete({ _id: id, userId });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete investment',
      error: error.message
    });
  }
};

// Get investment statistics
export const getInvestmentStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    // Build query with date filters
    const query: any = { userId };
    
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate as string);
      if (endDate) query.purchaseDate.$lte = new Date(endDate as string);
    }

    const investments = await Investment.find(query).lean();

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amountInvested), 0);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercentage = totalInvested === 0 ? 0 : (totalGainLoss / totalInvested) * 100;

    // Group by investment type
    const investmentsByType = investments.reduce((acc: any, inv) => {
      if (!acc[inv.type]) {
        acc[inv.type] = {
          count: 0,
          totalInvested: 0,
          totalCurrentValue: 0
        };
      }
      acc[inv.type].count++;
      acc[inv.type].totalInvested += inv.amountInvested;
      acc[inv.type].totalCurrentValue += (inv.currentValue || inv.amountInvested);
      return acc;
    }, {});

    // Calculate gains/losses by type
    Object.keys(investmentsByType).forEach(type => {
      const typeData = investmentsByType[type];
      typeData.gainLoss = typeData.totalCurrentValue - typeData.totalInvested;
      typeData.gainLossPercentage = typeData.totalInvested === 0 
        ? 0 
        : (typeData.gainLoss / typeData.totalInvested) * 100;
    });

    const stats = {
      totalInvestments: investments.length,
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      investmentsByType,
      topPerforming: investments
        .map(inv => ({
          ...inv,
          gainLoss: inv.currentValue ? inv.currentValue - inv.amountInvested : 0,
          gainLossPercentage: inv.currentValue && inv.amountInvested > 0 ? ((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100 : 0
        }))
        .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
        .slice(0, 5),
      worstPerforming: investments
        .map(inv => ({
          ...inv,
          gainLoss: inv.currentValue ? inv.currentValue - inv.amountInvested : 0,
          gainLossPercentage: inv.currentValue && inv.amountInvested > 0 ? ((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100 : 0
        }))
        .sort((a, b) => a.gainLossPercentage - b.gainLossPercentage)
        .slice(0, 5)
    };

    res.status(200).json({
      success: true,
      message: 'Investment statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    console.error('Get investment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve investment statistics',
      error: error.message
    });
  }
};