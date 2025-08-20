import { Request, Response } from 'express';
export declare const getTransactions: (req: Request, res: Response) => Promise<void>;
export declare const getTransaction: (req: Request, res: Response) => Promise<void>;
export declare const createTransaction: (req: Request, res: Response) => Promise<void>;
export declare const updateTransaction: (req: Request, res: Response) => Promise<void>;
export declare const deleteTransaction: (req: Request, res: Response) => Promise<void>;
export declare const deleteAllTransactions: (req: Request, res: Response) => Promise<void>;
export declare const getTransactionStats: (req: Request, res: Response) => Promise<void>;
export declare const getExpenseBreakdown: (req: Request, res: Response) => Promise<void>;
export declare const getMonthlyTrends: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=transactionController.d.ts.map