
import { Category, PaymentMethod } from './types';

export const COLORS = {
  background: '#000000',
  surface: '#111111',
  surfaceLight: '#1A1A1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#10B981', // Emerald 500
  cyan: '#06B6D4', // Cyan 500
  danger: '#EF4444', // Red 500
};

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank'];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', icon: '🍔', color: '#EF4444', isPrivate: false },
  { id: '2', name: 'Transport', icon: '🚗', color: '#3B82F6', isPrivate: false },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#8B5CF6', isPrivate: false },
  { id: '4', name: 'Bills', icon: '📄', color: '#F59E0B', isPrivate: false },
  { id: '5', name: 'Salary', icon: '💰', color: '#10B981', isPrivate: false },
  { id: '6', name: 'Entertainment', icon: '🎬', color: '#EC4899', isPrivate: false },
  { id: '7', name: 'Health', icon: '🏥', color: '#10B981', isPrivate: false },
];

export const APP_STORAGE_KEY = 'smart_expense_bdt_state_v1';
