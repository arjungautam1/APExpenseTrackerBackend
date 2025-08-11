// Mock data interface for development
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

// Mock data for development
export const mockMonthlyExpenses: MonthlyExpenseDto[] = [
  {
    _id: '1',
    userId: 'test-user-id',
    name: 'Apartment Rent',
    category: 'home',
    amount: 1200.00,
    dueDate: 1,
    description: 'Monthly apartment rent payment',
    isActive: true,
    lastPaidDate: new Date('2025-07-01'),
    nextDueDate: new Date('2025-09-01'),
    autoDeduct: true,
    tags: ['rent', 'housing', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  },
  {
    _id: '2',
    userId: 'test-user-id',
    name: 'Electricity Bill',
    category: 'home',
    amount: 85.50,
    dueDate: 15,
    description: 'Monthly electricity utility bill',
    isActive: true,
    lastPaidDate: new Date('2025-07-15'),
    nextDueDate: new Date('2025-08-15'),
    autoDeduct: true,
    tags: ['utilities', 'electricity', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  },
  {
    _id: '3',
    userId: 'test-user-id',
    name: 'Verizon Phone Plan',
    category: 'mobile',
    amount: 94.89,
    dueDate: 13,
    description: 'Monthly phone plan with unlimited data',
    isActive: true,
    lastPaidDate: new Date('2025-07-13'),
    nextDueDate: new Date('2025-08-13'),
    autoDeduct: true,
    tags: ['phone', 'mobile', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  },
  {
    _id: '4',
    userId: 'test-user-id',
    name: 'Xfinity Internet',
    category: 'internet',
    amount: 79.99,
    dueDate: 20,
    description: 'High-speed internet service',
    isActive: true,
    lastPaidDate: new Date('2025-07-20'),
    nextDueDate: new Date('2025-08-20'),
    autoDeduct: true,
    tags: ['internet', 'wifi', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  },
  {
    _id: '5',
    userId: 'test-user-id',
    name: 'Planet Fitness Membership',
    category: 'gym',
    amount: 24.99,
    dueDate: 5,
    description: 'Monthly gym membership',
    isActive: true,
    lastPaidDate: new Date('2025-08-05'),
    nextDueDate: new Date('2025-09-05'),
    autoDeduct: true,
    tags: ['gym', 'fitness', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  },
  {
    _id: '6',
    userId: 'test-user-id',
    name: 'Netflix Subscription',
    category: 'other',
    amount: 15.99,
    dueDate: 25,
    description: 'Monthly streaming subscription',
    isActive: true,
    lastPaidDate: new Date('2025-07-25'),
    nextDueDate: new Date('2025-08-25'),
    autoDeduct: true,
    tags: ['streaming', 'entertainment', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  },
  {
    _id: '7',
    userId: 'test-user-id',
    name: 'Spotify Premium',
    category: 'other',
    amount: 9.99,
    dueDate: 28,
    description: 'Monthly music streaming subscription',
    isActive: true,
    lastPaidDate: new Date('2025-07-28'),
    nextDueDate: new Date('2025-08-28'),
    autoDeduct: true,
    tags: ['music', 'streaming', 'monthly'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-08-10')
  }
];

export const mockMonthlyExpensesSummary = {
  totalMonthly: 1511.35,
  byCategory: {
    home: 1285.50,
    mobile: 94.89,
    internet: 79.99,
    gym: 24.99,
    other: 25.98
  },
  count: 7,
  dueThisMonth: 3
};
