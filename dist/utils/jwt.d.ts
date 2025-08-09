export interface JWTPayload {
    id: string;
    email: string;
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const generateRefreshToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => JWTPayload;
//# sourceMappingURL=jwt.d.ts.map