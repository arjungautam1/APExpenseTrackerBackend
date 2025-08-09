import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transfer from '../models/Transfer';

export const getTransfers = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const status = req.query.status as string | undefined;

    const query: any = { userId: (req as any).user?.id };
    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Transfer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transfer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to get transfers' });
  }
};

export const getTransfer = async (req: Request, res: Response) => {
  try {
    const item = await Transfer.findOne({ _id: req.params.id, userId: (req as any).user?.id });
    if (!item) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to get transfer' });
  }
};

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const {
      recipientName,
      amount,
      purpose,
      destinationCountry,
      transferMethod,
      fees,
      exchangeRate,
      status,
      transactionId,
    } = req.body;

    const transfer = await Transfer.create({
      userId: (req as any).user?.id,
      recipientName,
      amount: parseFloat(amount),
      purpose,
      destinationCountry: String(destinationCountry).toUpperCase(),
      transferMethod,
      fees: parseFloat(fees),
      exchangeRate: exchangeRate !== undefined ? parseFloat(exchangeRate) : undefined,
      status: status || 'pending',
      transactionId: transactionId && mongoose.Types.ObjectId.isValid(transactionId) ? transactionId : undefined,
    });

    res.status(201).json({ success: true, message: 'Transfer created successfully', data: transfer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create transfer' });
  }
};

export const updateTransfer = async (req: Request, res: Response) => {
  try {
    const update: any = {};
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
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (update.amount !== undefined) update.amount = parseFloat(update.amount);
    if (update.fees !== undefined) update.fees = parseFloat(update.fees);
    if (update.exchangeRate !== undefined) update.exchangeRate = parseFloat(update.exchangeRate);
    if (update.destinationCountry) update.destinationCountry = String(update.destinationCountry).toUpperCase();
    if (update.transactionId && !mongoose.Types.ObjectId.isValid(update.transactionId)) delete update.transactionId;

    const item = await Transfer.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user?.id },
      update,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, message: 'Transfer updated successfully', data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update transfer' });
  }
};

export const deleteTransfer = async (req: Request, res: Response) => {
  try {
    const item = await Transfer.findOne({ _id: req.params.id, userId: (req as any).user?.id });
    if (!item) return res.status(404).json({ success: false, message: 'Transfer not found' });
    await Transfer.findByIdAndDelete(item._id);
    res.json({ success: true, message: 'Transfer deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete transfer' });
  }
};



