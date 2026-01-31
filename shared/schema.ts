
import { pgTable, text, serial, integer, boolean, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  pin: text("pin"), // For PIN lock
  language: text("language").default("BN"), // BN or EN
  currency: text("currency").default("BDT"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").default("EXPENSE"), // EXPENSE or INCOME
  isPrivate: boolean("is_private").default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // INCOME or EXPENSE
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  paymentMethod: text("payment_method").default("Cash"), // Cash, bKash, Nagad, etc.
  note: text("note"),
  location: text("location"),
  isRecurring: boolean("is_recurring").default(false),
});

export const savings = pgTable("savings", {
  id: serial("id").primaryKey(),
  purpose: text("purpose").notNull(), // Where money is saved
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  note: text("note"),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  type: text("type").notNull(), // PAYABLE (Dena) or RECEIVABLE (Pona)
  amount: numeric("amount").notNull(),
  paidAmount: numeric("paid_amount").default("0"),
  status: text("status").default("PENDING"), // PENDING, PARTIAL, PAID
  dueDate: timestamp("due_date"),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertSavingsSchema = createInsertSchema(savings).omit({ id: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Saving = typeof savings.$inferSelect;
export type InsertSaving = z.infer<typeof insertSavingsSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
