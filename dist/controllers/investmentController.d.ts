import { Request, Response } from 'express';
export declare const getInvestments: (req: Request, res: Response) => Promise<void>;
export declare const getInvestment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createInvestment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateInvestment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInvestment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInvestmentStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=investmentController.d.ts.map