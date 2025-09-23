// context/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabaseService } from "@/services/SupabaseService";

type DataContextType = {
  products: any[];
  users: any[];
  transactions: any[];
  lowStock: any[];
  todaysSales: any[];
  refreshData: () => Promise<void>;
  createTransaction: (t: {
    product_id: string;
    quantity: number;
    total_price: number;
    user_id: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [todaysSales, setTodaysSales] = useState<any[]>([]);

  const refreshData = async () => {
    console.log("🔄 Refreshing all data from Supabase...");
    const [p, u, t, l, ts] = await Promise.all([
      supabaseService.getProducts(),
      supabaseService.getUsers(),
      supabaseService.getTodaysSales(),
      supabaseService.getLowStockProducts(),
      supabaseService.getTodaysSales(),
    ]);

    setProducts(p);
    setUsers(u);
    setTransactions(t);
    setLowStock(l);
    setTodaysSales(ts);
  };

  const createTransaction = async (transaction: {
    product_id: string;
    quantity: number;
    total_price: number;
    user_id: string;
  }) => {
    const result = await supabaseService.createTransaction(transaction);
    if (result.success) {
      await refreshData(); // ✅ refresh after insert
    }
    return result;
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        users,
        transactions,
        lowStock,
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
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
