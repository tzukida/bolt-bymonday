// contexts/DataContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SupabaseService } from "../services/supabaseService";

interface DataContextType {
  products: number;
  low: number;
  users: number;
  transactions: number;
  todaysSales: number;
  unreadCount: number;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState(0);
  const [low, setLow] = useState(0);
  const [users, setUsers] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshData = async () => {
    console.log("DataContext.refreshData: fetching all data...");

    const [productsCount, lowStock, usersCount, transactionsCount, todaysSalesAmount, unread] =
      await Promise.all([
        SupabaseService.getProducts(),
        SupabaseService.getLowStock(),
        SupabaseService.getUsers(),
        SupabaseService.getTransactions(),
        SupabaseService.getTodaysSales(),
        SupabaseService.getUnreadCount(),
      ]);

    setProducts(productsCount ?? 0);
    setLow(lowStock ?? 0);
    setUsers(usersCount ?? 0);
    setTransactions(transactionsCount ?? 0);
    setTodaysSales(todaysSalesAmount ?? 0);
    setUnreadCount(unread ?? 0);

    console.log("DataContext.refreshData: done", {
      products: productsCount,
      low: lowStock,
      users: usersCount,
      transactions: transactionsCount,
      todaysSales: todaysSalesAmount,
      unread,
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        low,
        users,
        transactions,
        todaysSales,
        unreadCount,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
};
