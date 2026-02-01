import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId?: number;
  paymentMethod: string;
  note?: string;
  month: string;
}

export interface Saving {
  id: number;
  purpose: string;
  amount: number;
  date: string;
  note?: string;
  month: string;
}

export interface Contact {
  id: number;
  name: string;
  phone?: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  amount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  dueDate?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  isPrivate: boolean;
}

export interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  isDefault: boolean;
}

export interface AppSettings {
  id: string;
  language: 'BN' | 'EN';
  currency: string;
  pinEnabled: boolean;
  pin?: string;
  notificationsEnabled: boolean;
  lastNotificationDate?: string;
}

export interface MonthlyBudget {
  id: string;
  month: string;
  startingBalance: number;
  salary: number;
}

interface FinanceDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-month': string; 'by-type': string };
  };
  savings: {
    key: number;
    value: Saving;
    indexes: { 'by-month': string };
  };
  contacts: {
    key: number;
    value: Contact;
    indexes: { 'by-type': string };
  };
  categories: {
    key: number;
    value: Category;
    indexes: { 'by-type': string };
  };
  paymentMethods: {
    key: number;
    value: PaymentMethod;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  monthlyBudgets: {
    key: string;
    value: MonthlyBudget;
    indexes: { 'by-month': string };
  };
}

let dbInstance: IDBPDatabase<FinanceDB> | null = null;

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Salary', icon: 'Briefcase', color: '#10B981', type: 'INCOME', isPrivate: false },
  { name: 'Business', icon: 'Store', color: '#3B82F6', type: 'INCOME', isPrivate: false },
  { name: 'Freelance', icon: 'Laptop', color: '#8B5CF6', type: 'INCOME', isPrivate: false },
  { name: 'Gift', icon: 'Gift', color: '#EC4899', type: 'INCOME', isPrivate: false },
  { name: 'Other Income', icon: 'Plus', color: '#6366F1', type: 'INCOME', isPrivate: false },
  { name: 'Food', icon: 'Utensils', color: '#F59E0B', type: 'EXPENSE', isPrivate: false },
  { name: 'Transport', icon: 'Car', color: '#EF4444', type: 'EXPENSE', isPrivate: false },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', type: 'EXPENSE', isPrivate: false },
  { name: 'Bills', icon: 'Receipt', color: '#6366F1', type: 'EXPENSE', isPrivate: false },
  { name: 'Entertainment', icon: 'Film', color: '#8B5CF6', type: 'EXPENSE', isPrivate: false },
  { name: 'Health', icon: 'Heart', color: '#EF4444', type: 'EXPENSE', isPrivate: false },
  { name: 'Education', icon: 'GraduationCap', color: '#3B82F6', type: 'EXPENSE', isPrivate: false },
  { name: 'Other', icon: 'MoreHorizontal', color: '#6B7280', type: 'EXPENSE', isPrivate: false },
];

const DEFAULT_PAYMENT_METHODS: Omit<PaymentMethod, 'id'>[] = [
  { name: 'Cash', icon: 'Banknote', isDefault: true },
  { name: 'bKash', icon: 'Smartphone', isDefault: false },
  { name: 'Nagad', icon: 'Smartphone', isDefault: false },
  { name: 'Rocket', icon: 'Smartphone', isDefault: false },
  { name: 'Bank', icon: 'Landmark', isDefault: false },
  { name: 'Binance', icon: 'Bitcoin', isDefault: false },
];

export async function getDB(): Promise<IDBPDatabase<FinanceDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FinanceDB>('hisab-kitab-db', 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        txStore.createIndex('by-month', 'month');
        txStore.createIndex('by-type', 'type');
      }
      
      if (!db.objectStoreNames.contains('savings')) {
        const savStore = db.createObjectStore('savings', { keyPath: 'id', autoIncrement: true });
        savStore.createIndex('by-month', 'month');
      }
      
      if (!db.objectStoreNames.contains('contacts')) {
        const conStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
        conStore.createIndex('by-type', 'type');
      }
      
      if (!db.objectStoreNames.contains('categories')) {
        const catStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        catStore.createIndex('by-type', 'type');
      }
      
      if (!db.objectStoreNames.contains('paymentMethods')) {
        db.createObjectStore('paymentMethods', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('monthlyBudgets')) {
        const budgetStore = db.createObjectStore('monthlyBudgets', { keyPath: 'id' });
        budgetStore.createIndex('by-month', 'month');
      }
    },
  });

  await initializeDefaults();
  return dbInstance;
}

async function initializeDefaults() {
  if (!dbInstance) return;

  const categories = await dbInstance.getAll('categories');
  if (categories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await dbInstance.add('categories', cat as Category);
    }
  }

  const paymentMethods = await dbInstance.getAll('paymentMethods');
  if (paymentMethods.length === 0) {
    for (const pm of DEFAULT_PAYMENT_METHODS) {
      await dbInstance.add('paymentMethods', pm as PaymentMethod);
    }
  }

  const settings = await dbInstance.get('settings', 'main');
  if (!settings) {
    await dbInstance.put('settings', {
      id: 'main',
      language: 'BN',
      currency: 'BDT',
      pinEnabled: false,
      notificationsEnabled: true,
    });
  }
}

export function getMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentMonth(): string {
  return getMonthKey(new Date());
}

export async function getTransactions(filters?: { month?: string; type?: string }): Promise<Transaction[]> {
  const db = await getDB();
  let transactions = await db.getAll('transactions');
  
  if (filters?.month) {
    transactions = transactions.filter(t => t.month === filters.month);
  }
  if (filters?.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(data: Omit<Transaction, 'id' | 'month'>): Promise<Transaction> {
  const db = await getDB();
  const month = getMonthKey(data.date);
  const id = await db.add('transactions', { ...data, month } as Transaction);
  return { ...data, id: id as number, month };
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);
}

export async function updateTransaction(id: number, data: Partial<Transaction>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('transactions', id);
  if (existing) {
    await db.put('transactions', { ...existing, ...data });
  }
}

export async function getSavings(month?: string): Promise<Saving[]> {
  const db = await getDB();
  let savings = await db.getAll('savings');
  
  if (month) {
    savings = savings.filter(s => s.month === month);
  }
  
  return savings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addSaving(data: Omit<Saving, 'id' | 'month'>): Promise<Saving> {
  const db = await getDB();
  const month = getMonthKey(data.date);
  const id = await db.add('savings', { ...data, month } as Saving);
  return { ...data, id: id as number, month };
}

export async function deleteSaving(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('savings', id);
}

export async function getContacts(): Promise<Contact[]> {
  const db = await getDB();
  return db.getAll('contacts');
}

export async function addContact(data: Omit<Contact, 'id'>): Promise<Contact> {
  const db = await getDB();
  const id = await db.add('contacts', data as Contact);
  return { ...data, id: id as number };
}

export async function updateContact(id: number, data: Partial<Contact>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('contacts', id);
  if (existing) {
    await db.put('contacts', { ...existing, ...data });
  }
}

export async function deleteContact(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('contacts', id);
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

export async function addCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const db = await getDB();
  const id = await db.add('categories', data as Category);
  return { ...data, id: id as number };
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('categories', id);
  if (existing) {
    await db.put('categories', { ...existing, ...data });
  }
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('categories', id);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const db = await getDB();
  return db.getAll('paymentMethods');
}

export async function addPaymentMethod(data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
  const db = await getDB();
  const id = await db.add('paymentMethods', data as PaymentMethod);
  return { ...data, id: id as number };
}

export async function updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('paymentMethods', id);
  if (existing) {
    await db.put('paymentMethods', { ...existing, ...data });
  }
}

export async function deletePaymentMethod(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('paymentMethods', id);
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'main');
  return settings || {
    id: 'main',
    language: 'BN',
    currency: 'BDT',
    pinEnabled: false,
    notificationsEnabled: true,
  };
}

export async function updateSettings(data: Partial<AppSettings>): Promise<void> {
  const db = await getDB();
  const existing = await getSettings();
  await db.put('settings', { ...existing, ...data });
}

export async function getMonthlyBudget(month: string): Promise<MonthlyBudget | undefined> {
  const db = await getDB();
  return db.get('monthlyBudgets', month);
}

export async function setMonthlyBudget(data: MonthlyBudget): Promise<void> {
  const db = await getDB();
  await db.put('monthlyBudgets', { ...data, id: data.month });
}

export interface MonthlyReport {
  income: number;
  expense: number;
  balance: number;
  savings: number;
  payable: number;
  receivable: number;
}

export async function getMonthlyReport(month: string): Promise<MonthlyReport> {
  const [transactions, savings, contacts] = await Promise.all([
    getTransactions({ month }),
    getSavings(month),
    getContacts(),
  ]);

  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

  const payable = contacts
    .filter(c => c.type === 'PAYABLE' && c.status !== 'PAID')
    .reduce((sum, c) => sum + (c.amount - c.paidAmount), 0);

  const receivable = contacts
    .filter(c => c.type === 'RECEIVABLE' && c.status !== 'PAID')
    .reduce((sum, c) => sum + (c.amount - c.paidAmount), 0);

  return {
    income,
    expense,
    balance: income - expense,
    savings: totalSavings,
    payable,
    receivable,
  };
}

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    transactions: await db.getAll('transactions'),
    savings: await db.getAll('savings'),
    contacts: await db.getAll('contacts'),
    categories: await db.getAll('categories'),
    paymentMethods: await db.getAll('paymentMethods'),
    settings: await db.get('settings', 'main'),
    monthlyBudgets: await db.getAll('monthlyBudgets'),
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(jsonString: string): Promise<void> {
  const db = await getDB();
  const data = JSON.parse(jsonString);

  if (data.transactions) {
    for (const tx of data.transactions) {
      await db.put('transactions', tx);
    }
  }
  if (data.savings) {
    for (const s of data.savings) {
      await db.put('savings', s);
    }
  }
  if (data.contacts) {
    for (const c of data.contacts) {
      await db.put('contacts', c);
    }
  }
  if (data.categories) {
    for (const cat of data.categories) {
      await db.put('categories', cat);
    }
  }
  if (data.paymentMethods) {
    for (const pm of data.paymentMethods) {
      await db.put('paymentMethods', pm);
    }
  }
  if (data.settings) {
    await db.put('settings', data.settings);
  }
  if (data.monthlyBudgets) {
    for (const b of data.monthlyBudgets) {
      await db.put('monthlyBudgets', b);
    }
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('transactions');
  await db.clear('savings');
  await db.clear('contacts');
  await db.clear('categories');
  await db.clear('paymentMethods');
  await db.clear('monthlyBudgets');
  await db.delete('settings', 'main');
  await initializeDefaults();
}

export async function getAllMonths(): Promise<string[]> {
  const db = await getDB();
  const transactions = await db.getAll('transactions');
  const savings = await db.getAll('savings');
  
  const months = new Set<string>();
  transactions.forEach(t => months.add(t.month));
  savings.forEach(s => months.add(s.month));
  months.add(getCurrentMonth());
  
  return Array.from(months).sort().reverse();
}
