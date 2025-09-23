// src/contexts/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

type Product = any;
type Transaction = any;
type User = any;

type DataContextType = {
  products: Product[];
  transactions: Transaction[];
  users: User[];
  lowStockProducts: Product[];
  todaysSales: number;
  refreshData: () => Promise<void>;
  createTransaction: (payload: Partial<Transaction>) => Promise<{ success: boolean; data?: any; error?: string }>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [todaysSales, setTodaysSales] = useState<number>(0);

  const refreshData = async () => {
    try {
      console.log('DataContext.refreshData: fetching all data...');
      const [p, u, t, low, sales] = await Promise.all([
        supabaseService.getProducts(),
        supabaseService.getUsers(),
        supabaseService.getTransactions(),
        supabaseService.getLowStockProducts(),
        supabaseService.getTodaysSales(), // NUMBER
      ]);

      setProducts(p);
      setUsers(u);
      setTransactions(t);
      setLowStockProducts(low);
      setTodaysSales(sales ?? 0);
      console.log('DataContext.refreshData: done', { products: p.length, users: u.length, transactions: t.length, low: low.length, todaysSales: sales });
    } catch (err) {
      console.error('DataContext.refreshData error:', err);
    }
  };

  const createTransaction = async (payload: Partial<Transaction>) => {
    try {
      const result = await supabaseService.createTransaction(payload);
      if (result.success) {
        // refresh to update products/transactions/totals
        await refreshData();
      }
      return result;
    } catch (err) {
      console.error('createTransaction error:', err);
      return { success: false, error: (err as Error).message };
    }
  };

  useEffect(() => {
    refreshData();
    // optionally setup realtime here
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        transactions,
        users,
        lowStockProducts,
        todaysSales,
        refreshData,
        createTransaction,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
