import { Request, Response } from 'express';
export declare const getLoans: (req: Request, res: Response) => Promise<void>;
export declare const getLoan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createLoan: (req: Request, res: Response) => Promise<void>;
export declare const updateLoan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteLoan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLoanSchedule: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=loanController.d.ts.map