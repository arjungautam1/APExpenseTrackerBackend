import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}
export {};
//# sourceMappingURL=auth.d.ts.map