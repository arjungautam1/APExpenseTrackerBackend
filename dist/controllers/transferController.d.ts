import { Request, Response } from 'express';
export declare const getTransfers: (req: Request, res: Response) => Promise<void>;
export declare const getTransfer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTransfer: (req: Request, res: Response) => Promise<void>;
export declare const updateTransfer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTransfer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=transferController.d.ts.map