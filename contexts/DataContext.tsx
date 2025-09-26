// contexts/DataContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabaseService } from "@/services/supabaseService";
import { APP_CONFIG } from "@/config/app";

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  created_at?: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "staff";
  email?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  product_id: string;
  quantity: number;
  total: number;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_id: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at?: string;
}

interface DataContextType {
  products: Product[];
  users: User[];
  transactions: Transaction[];
  logs: ActivityLog[];
  notifications: Notification[];
  unreadCount: number;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  addLog: (log: ActivityLog) => Promise<void>;
  addNotification: (notification: Notification) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getTodaysSales: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- SAMPLE DATA ---
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Espresso",
    price: 120,
    stock: 20,
    image: "https://images.pexels.com/photos/302901/pexels-photo-302901.jpeg",
    category: "Coffee",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Cappuccino",
    price: 150,
    stock: 15,
    image: "https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg",
    category: "Coffee",
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    role: "admin",
    email: "admin@example.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    username: "staff",
    role: "staff",
    email: "staff@example.com",
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    product_id: "1",
    quantity: 2,
    total: 240,
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_LOGS: ActivityLog[] = [
  {
    id: "1",
    action: "User admin logged in",
    user_id: "1",
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    message: "Low stock alert for Espresso",
    read: false,
    created_at: new Date().toISOString(),
  },
];

// --- PROVIDER ---
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      try {
        if (APP_CONFIG.features.useBackend) {
          console.log("Fetching from Supabase...");
          const [pRes, uRes, tRes, lRes, nRes] = await Promise.all([
            supabaseService.getProducts(),
            supabaseService.getUsers(),
            supabaseService.getTransactions(),
            supabaseService.getActivityLogs(),
            supabaseService.getNotifications(),
          ]);

          if (pRes.success) setProducts(pRes.data || []);
          if (uRes.success) setUsers(uRes.data || []);
          if (tRes.success) setTransactions(tRes.data || []);
          if (lRes.success) setLogs(lRes.data || []);
          if (nRes.success) setNotifications(nRes.data || []);
        } else {
          console.log("Loading from AsyncStorage...");
          const p = (await AsyncStorage.getItem(APP_CONFIG.storage.products)) || JSON.stringify(SAMPLE_PRODUCTS);
          const u = (await AsyncStorage.getItem(APP_CONFIG.storage.users)) || JSON.stringify(SAMPLE_USERS);
          const t = (await AsyncStorage.getItem(APP_CONFIG.storage.transactions)) || JSON.stringify(SAMPLE_TRANSACTIONS);
          const l = (await AsyncStorage.getItem(APP_CONFIG.storage.activityLogs)) || JSON.stringify(SAMPLE_LOGS);
          const n = (await AsyncStorage.getItem(APP_CONFIG.storage.notifications)) || JSON.stringify(SAMPLE_NOTIFICATIONS);

          setProducts(JSON.parse(p));
          setUsers(JSON.parse(u));
          setTransactions(JSON.parse(t));
          setLogs(JSON.parse(l));
          setNotifications(JSON.parse(n));
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    loadData();
  }, []);

  // --- CRUD HELPERS ---
  const addProduct = async (product: Product) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.createProduct(product);
    }
    const updated = [...products, product];
    setProducts(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.updateProduct(id, product);
    }
    const updated = products.map((p) => (p.id === id ? { ...p, ...product } : p));
    setProducts(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
  };

  const deleteProduct = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.deleteProduct(id);
    }
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
  };

  const addUser = async (user: User) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.createUser(user);
    }
    const updated = [...users, user];
    setUsers(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
  };

  const deleteUser = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.deleteUser(id);
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
  };

  const addTransaction = async (transaction: Transaction) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.createTransaction(transaction);
    }
    const updated = [...transactions, transaction];
    setTransactions(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.transactions, JSON.stringify(updated));
  };

  const addLog = async (log: ActivityLog) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.createActivityLog(log);
    }
    const updated = [...logs, log];
    setLogs(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.activityLogs, JSON.stringify(updated));
  };

  const addNotification = async (notification: Notification) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.createNotification(notification);
    }
    const updated = [notification, ...notifications];
    setNotifications(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
  };

  const markNotificationRead = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.markNotificationAsRead(id);
    }
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
  };

  const markAllNotificationsRead = async () => {
    if (APP_CONFIG.features.useBackend) {
      await supabaseService.markAllNotificationsAsRead();
    }
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
  };

  const getTodaysSales = () => {
    const today = new Date().toISOString().split("T")[0];
    return transactions
      .filter((t) => (t.created_at || "").startsWith(today))
      .reduce((sum, t) => sum + t.total, 0);
  };

  return (
    <DataContext.Provider
      value={{
        products,
        users,
        transactions,
        logs,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        addProduct,
        updateProduct,
        deleteProduct,
        addUser,
        deleteUser,
        addTransaction,
        addLog,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        getTodaysSales,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// --- HOOK ---
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
