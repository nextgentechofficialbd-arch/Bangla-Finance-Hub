console.log("ENV CHECK:", import.meta.env);
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "./supabase";

import { AppState, ViewType, Transaction } from './types';
import { loadState, saveState } from './storage';
import { COLORS } from './constants';
import Dashboard from './views/Dashboard';
import Transactions from './views/Transactions';
import Analytics from './views/Analytics';
import CalendarView from './views/CalendarView';
import Settings from './views/Settings';
import Categories from './views/Categories';
import AddTransaction from './views/AddTransaction';
import PINLock from './views/PINLock';
import BottomNav from './components/BottomNav';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isAuth, setIsAuth] = useState<boolean>(!state.pin);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);


  const handleUpdateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  }, []);

  const addTransaction = (t: Transaction) => {
    handleUpdateState(prev => ({ ...prev, transactions: [t, ...prev.transactions] }));
    setCurrentView('DASHBOARD');
  };

  const deleteTransaction = (id: string) => {
    handleUpdateState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const updateTransaction = (updated: Transaction) => {
    handleUpdateState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === updated.id ? updated : t)
    }));
    setEditingTransaction(null);
    setCurrentView('TRANSACTIONS');
  };

  const handleReset = (type: 'ALL' | 'EXPENSES' | 'INCOME' | 'CATEGORIES' | 'BALANCE') => {
    handleUpdateState(prev => {
      switch (type) {
        case 'ALL':
          localStorage.clear();
          window.location.reload();
          return prev;
        case 'EXPENSES':
          return { ...prev, transactions: prev.transactions.filter(t => t.type !== 'EXPENSE') };
        case 'INCOME':
          return { ...prev, transactions: prev.transactions.filter(t => t.type !== 'INCOME') };
        case 'CATEGORIES':
          return { ...prev, categories: [] };
        case 'BALANCE':
          return { ...prev, transactions: [] };
        default:
          return prev;
      }
    });
  };

  if (!isAuth && state.pin) {
    return <PINLock pin={state.pin} onUnlock={() => setIsAuth(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard 
                  state={state} 
                  onAddClick={() => setCurrentView('ADD_TRANSACTION')} 
                  onTransactionClick={(t) => {
                    setEditingTransaction(t);
                    setCurrentView('ADD_TRANSACTION');
                  }}
                  onViewChange={setCurrentView}
               />;
      case 'TRANSACTIONS':
        return <Transactions 
                  state={state} 
                  onDelete={deleteTransaction} 
                  onEdit={(t) => {
                    setEditingTransaction(t);
                    setCurrentView('ADD_TRANSACTION');
                  }} 
               />;
      case 'ANALYTICS':
        return <Analytics state={state} />;
      case 'CALENDAR':
        return <CalendarView state={state} />;
      case 'SETTINGS':
        return <Settings 
                  state={state} 
                  onUpdateState={handleUpdateState} 
                  onReset={handleReset} 
                  onViewChange={setCurrentView}
                />;
      case 'CATEGORIES':
        return <Categories state={state} onUpdateState={handleUpdateState} />;
      case 'ADD_TRANSACTION':
        return <AddTransaction 
                  categories={state.categories} 
                  onSave={editingTransaction ? updateTransaction : addTransaction} 
                  onCancel={() => {
                    setEditingTransaction(null);
                    setCurrentView('DASHBOARD');
                  }}
                  editingTransaction={editingTransaction}
               />;
      default:
        return <Dashboard state={state} onViewChange={setCurrentView} onAddClick={() => setCurrentView('ADD_TRANSACTION')} onTransactionClick={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <main className="flex-1 pb-24 overflow-x-hidden">
        {renderView()}
      </main>
      
      {currentView !== 'ADD_TRANSACTION' && (
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      )}
    </div>
  );
};

export default App;

