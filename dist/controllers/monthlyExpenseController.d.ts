import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const getMonthlyExpenses: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMonthlyExpensesByCategory: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createMonthlyExpense: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMonthlyExpense: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteMonthlyExpense: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const processMonthlyExpensePayment: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMonthlyExpensesSummary: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=monthlyExpenseController.d.ts.map