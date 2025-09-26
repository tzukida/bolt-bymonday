// context/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_CONFIG } from "@/config/app";
import { supabaseService } from "@/services/supabaseService";

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  created_at?: string;
}
export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "staff";
  created_at?: string;
}
export interface Transaction {
  id: string;
  productId: string;
  quantity: number;
  type: "in" | "out";
  created_at: string;
}
export interface ActivityLog {
  id: string;
  message: string;
  created_at: string;
}
export interface Notification {
  id: string;
  message: string;
  created_at: string;
}

// Sample Data
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Latte",
    price: 120,
    stock: 15,
    image: "https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg",
  },
  {
    id: "2",
    name: "Espresso",
    price: 80,
    stock: 25,
    image: "https://images.pexels.com/photos/34085/pexels-photo.jpg",
  },
];
const SAMPLE_USERS: User[] = [
  { id: "1", username: "admin", password: "admin123", role: "admin" },
  { id: "2", username: "staff", password: "staff123", role: "staff" },
];

// Context type
interface DataContextType {
  products: Product[];
  users: User[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  loading: boolean;

  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addUser: (u: Omit<User, "id">) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  addActivityLog: (msg: string) => Promise<void>;
  addNotification: (msg: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Create Context
const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
};

// Provider
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const useBackend = APP_CONFIG.features.useBackend;

  // ---------- LOAD DATA ----------
  const refreshData = async () => {
    setLoading(true);
    try {
      if (useBackend) {
        const [prodRes, userRes, transRes, logRes, notifRes] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getUsers(),
          supabaseService.getTransactions(),
          supabaseService.getActivityLogs(),
          supabaseService.getNotifications(),
        ]);
        setProducts(prodRes.success ? prodRes.data : SAMPLE_PRODUCTS);
        setUsers(userRes.success ? userRes.data : SAMPLE_USERS);
        setTransactions(transRes.success ? transRes.data : []);
        setActivityLogs(logRes.success ? logRes.data : []);
        setNotifications(notifRes.success ? notifRes.data : []);
      } else {
        const [localProds, localUsers, localTrans, localLogs, localNotifs] = await Promise.all([
          AsyncStorage.getItem(APP_CONFIG.storage.products),
          AsyncStorage.getItem(APP_CONFIG.storage.users),
          AsyncStorage.getItem(APP_CONFIG.storage.transactions),
          AsyncStorage.getItem(APP_CONFIG.storage.activityLogs),
          AsyncStorage.getItem(APP_CONFIG.storage.notifications),
        ]);

        setProducts(localProds ? JSON.parse(localProds) : SAMPLE_PRODUCTS);
        setUsers(localUsers ? JSON.parse(localUsers) : SAMPLE_USERS);
        setTransactions(localTrans ? JSON.parse(localTrans) : []);
        setActivityLogs(localLogs ? JSON.parse(localLogs) : []);
        setNotifications(localNotifs ? JSON.parse(localNotifs) : []);

        if (!localProds) await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(SAMPLE_PRODUCTS));
        if (!localUsers) await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(SAMPLE_USERS));
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setProducts(SAMPLE_PRODUCTS);
      setUsers(SAMPLE_USERS);
    } finally {
      setLoading(false);
    }
  };

  // ---------- CRUD HANDLERS ----------
  const addProduct = async (p: Omit<Product, "id">) => {
    if (useBackend) await supabaseService.createProduct(p);
    else {
      const newProduct = { ...p, id: Date.now().toString() };
      const updated = [...products, newProduct];
      setProducts(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
    }
    await refreshData();
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    if (useBackend) await supabaseService.updateProduct(id, p);
    else {
      const updated = products.map(prod => (prod.id === id ? { ...prod, ...p } : prod));
      setProducts(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
    }
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    if (useBackend) await supabaseService.deleteProduct(id);
    else {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
    }
    await refreshData();
  };

  const addUser = async (u: Omit<User, "id">) => {
    if (useBackend) await supabaseService.createUser(u);
    else {
      const newUser = { ...u, id: Date.now().toString() };
      const updated = [...users, newUser];
      setUsers(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
    }
    await refreshData();
  };

  const deleteUser = async (id: string) => {
    if (useBackend) await supabaseService.deleteUser(id);
    else {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
    }
    await refreshData();
  };

  const addTransaction = async (t: Omit<Transaction, "id">) => {
    if (useBackend) await supabaseService.createTransaction(t);
    else {
      const newT = { ...t, id: Date.now().toString() };
      const updated = [...transactions, newT];
      setTransactions(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.transactions, JSON.stringify(updated));
    }
    await refreshData();
  };

  const addActivityLog = async (msg: string) => {
    if (useBackend) await supabaseService.createActivityLog(msg);
    else {
      const log: ActivityLog = { id: Date.now().toString(), message: msg, created_at: new Date().toISOString() };
      const updated = [...activityLogs, log];
      setActivityLogs(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.activityLogs, JSON.stringify(updated));
    }
    await refreshData();
  };

  const addNotification = async (msg: string) => {
    if (useBackend) await supabaseService.createNotification(msg);
    else {
      const notif: Notification = { id: Date.now().toString(), message: msg, created_at: new Date().toISOString() };
      const updated = [...notifications, notif];
      setNotifications(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
    }
    await refreshData();
  };

  // Init
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        users,
        transactions,
        activityLogs,
        notifications,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addUser,
        deleteUser,
        addTransaction,
        addActivityLog,
        addNotification,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
