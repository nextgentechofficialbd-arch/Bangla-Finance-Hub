import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'BN' | 'EN';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.EN) => string;
}

const translations = {
  EN: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    savings: 'Savings',
    contacts: 'Contacts', // Dena-Pona
    settings: 'Settings',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    payable: 'Payable',
    receivable: 'Receivable',
    addTransaction: 'Add Transaction',
    addSaving: 'Add Saving',
    addContact: 'Add Contact',
    save: 'Save',
    cancel: 'Cancel',
    amount: 'Amount',
    note: 'Note',
    date: 'Date',
    category: 'Category',
    paymentMethod: 'Payment Method',
    type: 'Type',
    name: 'Name',
    phone: 'Phone',
    status: 'Status',
    language: 'Language',
    currency: 'Currency',
    search: 'Search...',
    recentTransactions: 'Recent Transactions',
    noData: 'No data available',
    totalSavings: 'Total Savings',
    cash: 'Cash',
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    bank: 'Bank',
    binance: 'Binance',
    purpose: 'Purpose',
  },
  BN: {
    dashboard: 'ড্যাশবোর্ড',
    transactions: 'লেনদেন',
    savings: 'জমা',
    contacts: 'দেনা-পাওনা',
    settings: 'সেটিংস',
    income: 'আয়',
    expense: 'ব্যয়',
    balance: 'অবশিষ্ট',
    payable: 'দেনা',
    receivable: 'পাওনা',
    addTransaction: 'লেনদেন যোগ করুন',
    addSaving: 'জমা যোগ করুন',
    addContact: 'কন্টাক্ট যোগ করুন',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    amount: 'টাকা',
    note: 'নোট',
    date: 'তারিখ',
    category: 'ক্যাটাগরি',
    paymentMethod: 'পেমেন্ট মেথড',
    type: 'ধরণ',
    name: 'নাম',
    phone: 'মোবাইল',
    status: 'অবস্থা',
    language: 'ভাষা',
    currency: 'মুদ্রা',
    search: 'অনুসন্ধান...',
    recentTransactions: 'সাম্প্রতিক লেনদেন',
    noData: 'কোন তথ্য নেই',
    totalSavings: 'মোট জমা',
    cash: 'নগদ',
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    rocket: 'রকেট',
    bank: 'ব্যাংক',
    binance: 'বাইনান্স',
    purpose: 'উদ্দেশ্য',
  },
};

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: 'BN',
      setLanguage: (language) => set({ language }),
      t: (key) => translations[get().language][key] || key,
    }),
    {
      name: 'finance-app-i18n',
    }
  )
);
