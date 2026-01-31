
import { db } from "./db";
import {
  users, categories, transactions, savings, contacts,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Transaction, type InsertTransaction,
  type Saving, type InsertSaving,
  type Contact, type InsertContact
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User/Settings
  getUser(): Promise<User | undefined>;
  updateUser(settings: Partial<InsertUser>): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Transactions
  getTransactions(filters?: {
    month?: string;
    type?: string;
    categoryId?: string;
    paymentMethod?: string;
    search?: string;
  }): Promise<(Transaction & { category: Category | null })[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Savings
  getSavings(): Promise<Saving[]>;
  createSaving(saving: InsertSaving): Promise<Saving>;
  deleteSaving(id: number): Promise<void>;

  // Contacts (Dena-Pona)
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Reports
  getMonthlyReport(month: string): Promise<{
    income: number;
    expense: number;
    balance: number;
    savings: number;
    payable: number;
    receivable: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(): Promise<User | undefined> {
    const [user] = await db.select().from(users).limit(1);
    return user;
  }

  async updateUser(settings: Partial<InsertUser>): Promise<User> {
    const [existing] = await db.select().from(users).limit(1);
    if (existing) {
      const [updated] = await db.update(users)
        .set(settings)
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(users).values(settings as InsertUser).returning();
      return created;
    }
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async getTransactions(filters?: {
    month?: string;
    type?: string;
    categoryId?: string;
    paymentMethod?: string;
    search?: string;
  }): Promise<(Transaction & { category: Category | null })[]> {
    let conditions = [];

    if (filters?.month) {
      // Assuming month is 'YYYY-MM'
      const startOfMonth = new Date(`${filters.month}-01`);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      conditions.push(sql`${transactions.date} >= ${startOfMonth.toISOString()} AND ${transactions.date} <= ${endOfMonth.toISOString()}`);
    }

    if (filters?.type) {
      conditions.push(eq(transactions.type, filters.type));
    }

    if (filters?.categoryId) {
      conditions.push(eq(transactions.categoryId, parseInt(filters.categoryId)));
    }

    if (filters?.paymentMethod) {
      conditions.push(eq(transactions.paymentMethod, filters.paymentMethod));
    }

    if (filters?.search) {
      conditions.push(sql`${transactions.note} ILIKE ${`%${filters.search}%`}`);
    }

    const result = await db.select({
      transaction: transactions,
      category: categories,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));

    return result.map(r => ({ ...r.transaction, category: r.category }));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updated] = await db.update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getSavings(): Promise<Saving[]> {
    return await db.select().from(savings).orderBy(desc(savings.date));
  }

  async createSaving(saving: InsertSaving): Promise<Saving> {
    const [created] = await db.insert(savings).values(saving).returning();
    return created;
  }

  async deleteSaving(id: number): Promise<void> {
    await db.delete(savings).where(eq(savings.id, id));
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.id));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const [updated] = await db.update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getMonthlyReport(month: string): Promise<{
    income: number;
    expense: number;
    balance: number;
    savings: number;
    payable: number;
    receivable: number;
  }> {
    // Helper to sum
    const sum = (rows: any[], field: string) => rows.reduce((acc, row) => acc + Number(row[field]), 0);

    // Get transactions for month
    const txs = await this.getTransactions({ month });
    const income = sum(txs.filter(t => t.type === 'INCOME'), 'amount');
    const expense = sum(txs.filter(t => t.type === 'EXPENSE'), 'amount');

    // Get savings for month (approximated by filter logic if we had month filter for savings, but for now getting all or filtering here)
    // Savings might be cumulative or monthly. The requirement says "Monthly & total savings".
    // Let's filter savings by month manually here since we didn't add filters to getSavings
    const allSavings = await this.getSavings();
    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    
    const monthlySavings = allSavings.filter(s => {
      const d = new Date(s.date);
      return d >= startOfMonth && d <= endOfMonth;
    });
    const savingsAmount = sum(monthlySavings, 'amount');

    // Dena-Pona (Cumulative, usually)
    const contactsList = await this.getContacts();
    const payable = sum(contactsList.filter(c => c.type === 'PAYABLE'), 'amount') - sum(contactsList.filter(c => c.type === 'PAYABLE'), 'paidAmount');
    const receivable = sum(contactsList.filter(c => c.type === 'RECEIVABLE'), 'amount') - sum(contactsList.filter(c => c.type === 'RECEIVABLE'), 'paidAmount');

    return {
      income,
      expense,
      balance: income - expense,
      savings: savingsAmount,
      payable,
      receivable
    };
  }
}

export const storage = new DatabaseStorage();
