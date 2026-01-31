
export type TransactionType = 'EXPENSE' | 'INCOME';

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Bank';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isPrivate: boolean;
  budget?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  subCategory?: string;
  paymentMethod: PaymentMethod;
  note: string;
  location?: string;
}

export interface Budget {
  totalMonthly: number;
  dailyLimit: number; // Added daily spending limit
  categoryBudgets: Record<string, number>;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  pin: string | null;
  isLocked: boolean;
  budget: Budget;
  language: 'EN' | 'BN';
}

export type ViewType = 'DASHBOARD' | 'TRANSACTIONS' | 'ANALYTICS' | 'CALENDAR' | 'SETTINGS' | 'CATEGORIES' | 'ADD_TRANSACTION';
