// contexts/DataContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabaseService } from "@/services/supabaseService";
import { APP_CONFIG } from "@/config/app";
import type { Json } from "@/types/database";

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "staff";
  email?: string;
  password?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  payment_method: string;
  user_id: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_id: string;
  user_role: string;
  type: string;
  details?: Json | null;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at?: string;
}

interface DataContextType {
  products: Product[];
  users: User[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'created_at'>) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getTodaysSales: () => number;
  getLowStockProducts: () => Product[];
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
  {
    id: "3",
    name: "Latte",
    price: 140,
    stock: 3,
    image: "https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg",
    category: "Coffee",
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    email: "admin@example.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    username: "staff",
    password: "staff123",
    role: "staff",
    email: "staff@example.com",
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    items: [
      {
        product: SAMPLE_PRODUCTS[0],
        quantity: 2
      }
    ],
    total: 240,
    payment_method: "Cash",
    user_id: "admin",
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_LOGS: ActivityLog[] = [
  {
    id: "1",
    action: "User admin logged in",
    user_id: "admin",
    user_role: "admin",
    type: "login",
    details: null,
    created_at: new Date().toISOString(),
  },
];

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Low Stock Alert",
    message: "Latte is running low on stock (3 remaining)",
    type: "warning",
    read: false,
    created_at: new Date().toISOString(),
  },
];

// --- PROVIDER ---
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  // --- INITIAL LOAD ---
  useEffect(() => {
    mounted.current = true;
    const loadData = async () => {
      try {
        console.log("Loading data...");
        if (APP_CONFIG.features.useBackend) {
          console.log("Fetching from Supabase...");
          const [pRes, uRes, tRes, lRes, nRes] = await Promise.all([
            supabaseService.getProducts(),
            supabaseService.getUsers(),
            supabaseService.getTransactions(),
            supabaseService.getActivityLogs(),
            supabaseService.getNotifications(),
          ]);

          if (mounted.current) {
            if (pRes.success) setProducts(pRes.data || SAMPLE_PRODUCTS);
            if (uRes.success) setUsers(uRes.data || SAMPLE_USERS);
            if (tRes.success) setTransactions(tRes.data || SAMPLE_TRANSACTIONS);
            if (lRes.success) setActivityLogs(lRes.data || SAMPLE_LOGS);
            if (nRes.success) setNotifications(nRes.data || SAMPLE_NOTIFICATIONS);
          }
        } else {
          console.log("Loading from AsyncStorage...");
          const p = (await AsyncStorage.getItem(APP_CONFIG.storage.products)) || JSON.stringify(SAMPLE_PRODUCTS);
          const u = (await AsyncStorage.getItem(APP_CONFIG.storage.users)) || JSON.stringify(SAMPLE_USERS);
          const t = (await AsyncStorage.getItem(APP_CONFIG.storage.transactions)) || JSON.stringify(SAMPLE_TRANSACTIONS);
          const l = (await AsyncStorage.getItem(APP_CONFIG.storage.activityLogs)) || JSON.stringify(SAMPLE_LOGS);
          const n = (await AsyncStorage.getItem(APP_CONFIG.storage.notifications)) || JSON.stringify(SAMPLE_NOTIFICATIONS);

          if (mounted.current) {
            setProducts(JSON.parse(p));
            setUsers(JSON.parse(u));
            setTransactions(JSON.parse(t));
            setActivityLogs(JSON.parse(l));
            setNotifications(JSON.parse(n));
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        // Fallback to sample data
        if (mounted.current) {
          setProducts(SAMPLE_PRODUCTS);
          setUsers(SAMPLE_USERS);
          setTransactions(SAMPLE_TRANSACTIONS);
          setActivityLogs(SAMPLE_LOGS);
          setNotifications(SAMPLE_NOTIFICATIONS);
        }
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };
    loadData();

    return () => {
      mounted.current = false;
    };
  }, []);

  // --- CRUD HELPERS ---
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const product: Product = {
      ...productData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.createProduct(product);
      if (!result.success) {
        console.error("Failed to create product:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = [...products, product];
      setProducts(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updatedProduct = { ...productData, updated_at: new Date().toISOString() };
    
    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.updateProduct(id, updatedProduct);
      if (!result.success) {
        console.error("Failed to update product:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p));
      setProducts(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
    }
  };

  const deleteProduct = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.deleteProduct(id);
      if (!result.success) {
        console.error("Failed to delete product:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updated));
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.createUser(user);
      if (!result.success) {
        console.error("Failed to create user:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = [...users, user];
      setUsers(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
    }
  };

  const updateUser = async (user: User) => {
    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.updateUser(user.id, user);
      if (!result.success) {
        console.error("Failed to update user:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = users.map((u) => (u.id === user.id ? user : u));
      setUsers(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
    }
  };

  const deleteUser = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.deleteUser(id);
      if (!result.success) {
        console.error("Failed to delete user:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.users, JSON.stringify(updated));
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.createTransaction(transaction);
      if (!result.success) {
        console.error("Failed to create transaction:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = [...transactions, transaction];
      setTransactions(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.transactions, JSON.stringify(updated));

      // Update product stock
      const updatedProducts = [...products];
      transaction.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.product.id);
        if (productIndex !== -1) {
          updatedProducts[productIndex].stock -= item.quantity;
        }
      });
      setProducts(updatedProducts);
      await AsyncStorage.setItem(APP_CONFIG.storage.products, JSON.stringify(updatedProducts));

      // Check for low stock and create notifications
      const lowStockProducts = updatedProducts.filter(p => p.stock <= APP_CONFIG.lowStockThreshold);
      for (const product of lowStockProducts) {
        await addNotification({
          title: "Low Stock Alert",
          message: `${product.name} is running low on stock (${product.stock} remaining)`,
          type: "warning",
          read: false,
        });
      }

      // Log the transaction
      await addActivityLog({
        action: `Transaction completed - ${transaction.items.length} items, Total: ₱${transaction.total}`,
        user_id: transaction.user_id,
        user_role: "staff",
        type: "transaction",
        details: { items: transaction.items, total: transaction.total, payment_method: transaction.payment_method },
      });
    }
  };

  const addActivityLog = async (logData: Omit<ActivityLog, 'id' | 'created_at'>) => {
    const log: ActivityLog = {
      ...logData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.createActivityLog(log);
      if (!result.success) {
        console.error("Failed to create activity log:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = [log, ...activityLogs];
      setActivityLogs(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.activityLogs, JSON.stringify(updated));
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.createNotification(notification);
      if (!result.success) {
        console.error("Failed to create notification:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = [notification, ...notifications];
      setNotifications(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
    }
  };

  const markNotificationRead = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.markNotificationAsRead(id);
      if (!result.success) {
        console.error("Failed to mark notification as read:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      setNotifications(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
    }
  };

  const markAllNotificationsRead = async () => {
    if (APP_CONFIG.features.useBackend) {
      const result = await supabaseService.markAllNotificationsAsRead();
      if (!result.success) {
        console.error("Failed to mark all notifications as read:", result.error);
        return;
      }
    }
    
    if (mounted.current) {
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      await AsyncStorage.setItem(APP_CONFIG.storage.notifications, JSON.stringify(updated));
    }
  };

  const getTodaysSales = () => {
    const today = new Date().toISOString().split("T")[0];
    return transactions
      .filter((t) => (t.created_at || "").startsWith(today))
      .reduce((sum, t) => sum + t.total, 0);
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= APP_CONFIG.lowStockThreshold);
  };

  return (
    <DataContext.Provider
      value={{
        products,
        users,
        transactions,
        activityLogs,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addUser,
        updateUser,
        deleteUser,
        addTransaction,
        addActivityLog,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        getTodaysSales,
        getLowStockProducts,
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