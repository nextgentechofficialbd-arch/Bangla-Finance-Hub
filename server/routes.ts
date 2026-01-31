
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema, insertTransactionSchema, insertCategorySchema, insertSavingsSchema, insertContactSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const user = await storage.getUser();
    res.json(user || {});
  });

  app.patch(api.settings.update.path, async (req, res) => {
    const settings = api.settings.update.input.parse(req.body);
    const updated = await storage.updateUser(settings);
    res.json(updated);
  });

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post(api.categories.create.path, async (req, res) => {
    const category = api.categories.create.input.parse(req.body);
    const created = await storage.createCategory(category);
    res.status(201).json(created);
  });

  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    const filters = api.transactions.list.input?.parse(req.query);
    const transactions = await storage.getTransactions(filters);
    res.json(transactions);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    // Coerce amount to number
    const body = { ...req.body, amount: Number(req.body.amount), date: new Date(req.body.date) };
    const transaction = api.transactions.create.input.parse(body);
    const created = await storage.createTransaction(transaction);
    res.status(201).json(created);
  });

  app.put(api.transactions.update.path, async (req, res) => {
    const body = { ...req.body };
    if (body.amount) body.amount = Number(body.amount);
    if (body.date) body.date = new Date(body.date);
    
    const transaction = api.transactions.update.input.parse(body);
    const updated = await storage.updateTransaction(Number(req.params.id), transaction);
    res.json(updated);
  });

  app.delete(api.transactions.delete.path, async (req, res) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.status(204).send();
  });

  // Savings
  app.get(api.savings.list.path, async (req, res) => {
    const savings = await storage.getSavings();
    res.json(savings);
  });

  app.post(api.savings.create.path, async (req, res) => {
    const body = { ...req.body, amount: Number(req.body.amount), date: new Date(req.body.date) };
    const saving = api.savings.create.input.parse(body);
    const created = await storage.createSaving(saving);
    res.status(201).json(created);
  });

  app.delete(api.savings.delete.path, async (req, res) => {
    await storage.deleteSaving(Number(req.params.id));
    res.status(204).send();
  });

  // Contacts
  app.get(api.contacts.list.path, async (req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.post(api.contacts.create.path, async (req, res) => {
    const body = { ...req.body, amount: Number(req.body.amount), paidAmount: Number(req.body.paidAmount || 0) };
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    
    const contact = api.contacts.create.input.parse(body);
    const created = await storage.createContact(contact);
    res.status(201).json(created);
  });

  app.patch(api.contacts.update.path, async (req, res) => {
    const body = { ...req.body };
    if (body.amount) body.amount = Number(body.amount);
    if (body.paidAmount) body.paidAmount = Number(body.paidAmount);
    if (body.dueDate) body.dueDate = new Date(body.dueDate);

    const contact = api.contacts.update.input.parse(body);
    const updated = await storage.updateContact(Number(req.params.id), contact);
    res.json(updated);
  });

  app.delete(api.contacts.delete.path, async (req, res) => {
    await storage.deleteContact(Number(req.params.id));
    res.status(204).send();
  });

  // Reports
  app.get(api.reports.monthly.path, async (req, res) => {
    const { month } = api.reports.monthly.input.parse(req.query);
    const report = await storage.getMonthlyReport(month);
    res.json(report);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCategories = await storage.getCategories();
  if (existingCategories.length === 0) {
    const defaults = [
      { name: 'Food', icon: '🍔', color: '#EF4444', type: 'EXPENSE' },
      { name: 'Transport', icon: '🚗', color: '#3B82F6', type: 'EXPENSE' },
      { name: 'Shopping', icon: '🛍️', color: '#8B5CF6', type: 'EXPENSE' },
      { name: 'Bills', icon: '📄', color: '#F59E0B', type: 'EXPENSE' },
      { name: 'Entertainment', icon: '🎬', color: '#EC4899', type: 'EXPENSE' },
      { name: 'Health', icon: '🏥', color: '#10B981', type: 'EXPENSE' },
      { name: 'Salary', icon: '💰', color: '#10B981', type: 'INCOME' },
      { name: 'Business', icon: '💼', color: '#3B82F6', type: 'INCOME' },
      { name: 'Freelance', icon: '💻', color: '#8B5CF6', type: 'INCOME' },
    ];
    for (const cat of defaults) {
      await storage.createCategory(cat);
    }
  }

  // Add some sample transactions if none exist
  const existingTx = await storage.getTransactions();
  if (existingTx.length === 0) {
    // We need category IDs first
    const cats = await storage.getCategories();
    const salaryCat = cats.find(c => c.name === 'Salary');
    const foodCat = cats.find(c => c.name === 'Food');
    
    if (salaryCat) {
      await storage.createTransaction({
        amount: 50000,
        type: 'INCOME',
        date: new Date(),
        categoryId: salaryCat.id,
        paymentMethod: 'Bank',
        note: 'Monthly Salary',
        isRecurring: true
      });
    }

    if (foodCat) {
      await storage.createTransaction({
        amount: 500,
        type: 'EXPENSE',
        date: new Date(),
        categoryId: foodCat.id,
        paymentMethod: 'Cash',
        note: 'Lunch'
      });
    }
  }
}
