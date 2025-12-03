export interface Expense {
  id: string;
  timestamp: string;
  date: string;
  category: Category;
  subCategory?: string;
  amount: number;
  paidBy: FamilyMember;
  forWhom: FamilyMember | 'Shared';
  notes: string;
}

export type Category =
  | 'Food'
  | 'Utilities'
  | 'Groceries'
  | 'Kids'
  | 'Medical'
  | 'House Maintenance'
  | 'Fuel'
  | 'Salaries of Servants'
  | 'Misc';

export type FamilyMember =
  | 'Father'
  | 'Mother'
  | 'Saif'
  | 'Saif Wife'
  | 'Daughter'
  | 'Brother'
  | 'Brother Wife'
  | 'Kids';

export const CATEGORIES: Category[] = [
  'Food',
  'Utilities',
  'Groceries',
  'Kids',
  'Medical',
  'House Maintenance',
  'Fuel',
  'Salaries of Servants',
  'Misc',
];

export const FAMILY_MEMBERS: FamilyMember[] = [
  'Father',
  'Mother',
  'Saif',
  'Saif Wife',
  'Daughter',
  'Brother',
  'Brother Wife',
  'Kids',
];

export const SUB_CATEGORIES: Record<Category, string[]> = {
  'Food': ['Restaurant', 'Takeaway', 'Snacks', 'Beverages'],
  'Utilities': ['Electricity', 'Gas', 'Water', 'Internet', 'Phone'],
  'Groceries': ['Kitchen Items', 'Bath Items', 'Cleaning Supplies', 'Dairy', 'Vegetables', 'Fruits', 'Meat', 'Dry Goods'],
  'Kids': ['Education', 'Toys', 'Clothing', 'Activities', 'Healthcare'],
  'Medical': ['Doctor Visit', 'Medicine', 'Lab Tests', 'Hospital', 'Dental'],
  'House Maintenance': ['Repairs', 'Painting', 'Plumbing', 'Electrical', 'Furniture', 'Appliances'],
  'Fuel': ['Petrol', 'Diesel', 'CNG', 'Vehicle Service'],
  'Salaries of Servants': ['Maid', 'Cook', 'Driver', 'Gardener', 'Security', 'Other Staff'],
  'Misc': ['Other'],
};

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food': 'hsl(var(--chart-1))',
  'Utilities': 'hsl(var(--chart-2))',
  'Groceries': 'hsl(var(--chart-3))',
  'Kids': 'hsl(var(--chart-4))',
  'Medical': 'hsl(var(--chart-5))',
  'House Maintenance': 'hsl(var(--chart-6))',
  'Fuel': 'hsl(var(--chart-7))',
  'Salaries of Servants': 'hsl(var(--chart-8))',
  'Misc': 'hsl(var(--muted-foreground))',
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export interface Budget {
  id: string;
  userId: string;
  category: Category | null; // null = overall budget
  amount: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description?: string;
  fromMember?: string;
  date: string;
  createdAt: string;
}
