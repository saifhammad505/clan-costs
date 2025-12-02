export interface Expense {
  id: string;
  timestamp: string;
  date: string;
  category: Category;
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

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food': 'hsl(var(--chart-1))',
  'Utilities': 'hsl(var(--chart-2))',
  'Groceries': 'hsl(var(--chart-3))',
  'Kids': 'hsl(var(--chart-4))',
  'Medical': 'hsl(var(--chart-5))',
  'House Maintenance': 'hsl(var(--chart-6))',
  'Fuel': 'hsl(var(--chart-7))',
  'Misc': 'hsl(var(--chart-8))',
};
