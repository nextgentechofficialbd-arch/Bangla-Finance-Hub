
import { AppState } from './types';
import { APP_STORAGE_KEY, DEFAULT_CATEGORIES } from './constants';

const initialState: AppState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  pin: null,
  isLocked: false,
  budget: {
    totalMonthly: 0,
    dailyLimit: 0, // Default 0 means no limit set
    categoryBudgets: {},
  },
  language: 'EN',
};

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    return { ...initialState, ...parsed };
  } catch (e) {
    return initialState;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const clearAllData = () => {
  localStorage.removeItem(APP_STORAGE_KEY);
  window.location.reload();
};
