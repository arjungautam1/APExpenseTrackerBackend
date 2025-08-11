interface MonthlyExpenseDto {
    _id: string;
    userId: string;
    name: string;
    category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
    amount: number;
    dueDate: number;
    description: string;
    isActive: boolean;
    lastPaidDate?: Date;
    nextDueDate: Date;
    autoDeduct: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const mockMonthlyExpenses: MonthlyExpenseDto[];
export declare const mockMonthlyExpensesSummary: {
    totalMonthly: number;
    byCategory: {
        home: number;
        mobile: number;
        internet: number;
        gym: number;
        other: number;
    };
    count: number;
    dueThisMonth: number;
};
export {};
//# sourceMappingURL=mockDatabase.d.ts.map