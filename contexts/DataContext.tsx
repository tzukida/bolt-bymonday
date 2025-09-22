import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { APP_CONFIG } from '@/config/appConfig';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  timestamp: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  email?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userRole: string;
  timestamp: string;
  details?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'transaction' | 'user' | 'system';
  timestamp: string;
  read: boolean;
}

interface DataContextType {
  products: Product[];
  transactions: Transaction[];
  users: User[];
  notifications: Notification[];
  unreadCount: number;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  emailLowStockSuppliers: () => Promise<void>;
  logActivity: (action: string, details?: any) => Promise<void>;
  getTodaysSales: () => number;
  getLowStockProducts: () => Product[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const SAMPLE_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@bymonday.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    email: 'staff@bymonday.com',
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Espresso',
    price: 85,
    stock: 25,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Coffee'
  },
  {
    id: '2',
    name: 'Cappuccino',
    price: 120,
    stock: 18,
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Coffee'
  },
  {
    id: '3',
    name: 'Latte',
    price: 135,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 8,
    category: 'Coffee'
  },
  {
    id: '4',
    name: 'Americano',
    price: 95,
    stock: 30,
    image: 'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Coffee'
  },
  {
    id: '5',
    name: 'Croissant',
    price: 65,
    stock: 12,
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Pastry'
  },
  {
    id: '6',
    name: 'Blueberry Muffin',
    price: 75,
    stock: 3,
    image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Pastry'
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
    checkLowStock();
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadData = async () => {
    try {
      if (APP_CONFIG.features.useBackend) {
        // Load from Supabase
        const [productsResult, transactionsResult, usersResult, notificationsResult, logsResult] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getTransactions(),
          supabaseService.getUsers(),
          supabaseService.getNotifications(),
          supabaseService.getActivityLogs()
        ]);

        if (productsResult.success) setProducts(productsResult.data || []);
        if (transactionsResult.success) setTransactions(transactionsResult.data || []);
        if (usersResult.success) setUsers(usersResult.data || []);
        if (notificationsResult.success) setNotifications(notificationsResult.data || []);
      } else {
        // Load from local storage
        const productsData = await AsyncStorage.getItem('products');
        if (productsData) {
          setProducts(JSON.parse(productsData));
        } else {
          // Initialize with sample data
          await AsyncStorage.setItem('products', JSON.stringify(SAMPLE_PRODUCTS));
          setProducts(SAMPLE_PRODUCTS);
        }

        // Load transactions
        const transactionsData = await AsyncStorage.getItem('transactions');
        if (transactionsData) {
          setTransactions(JSON.parse(transactionsData));
        }

        // Load users
        const usersData = await AsyncStorage.getItem('users');
        if (usersData) {
          setUsers(JSON.parse(usersData));
        } else {
          await AsyncStorage.setItem('users', JSON.stringify(SAMPLE_USERS));
          setUsers(SAMPLE_USERS);
        }

        // Load notifications
        const notificationsData = await AsyncStorage.getItem('notifications');
        if (notificationsData) {
          setNotifications(JSON.parse(notificationsData));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts(SAMPLE_PRODUCTS);
      setUsers(SAMPLE_USERS);
    }
  };

  const checkLowStock = async () => {
    try {
      const productsData = await AsyncStorage.getItem('products');
      if (productsData) {
        const currentProducts = JSON.parse(productsData);
        const lowStockProducts = currentProducts.filter((p: Product) => p.stock <= 10);
        
        if (lowStockProducts.length > 0) {
          const notification: Notification = {
            id: Date.now().toString(),
            title: 'Low Stock Alert',
            message: `${lowStockProducts.length} products are running low on stock`,
            type: 'low_stock',
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          const existingNotifications = await AsyncStorage.getItem('notifications');
          const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
          
          // Check if similar notification exists in last hour
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const recentLowStockNotification = notifications.find((n: Notification) => 
            n.type === 'low_stock' && new Date(n.timestamp) > oneHourAgo
          );
          
          if (!recentLowStockNotification) {
            notifications.unshift(notification);
            await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
            setNotifications(notifications);
          }
        }
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  };

  const logActivity = async (action: string, details?: any) => {
    if (!user) return;
    
    try {
      const log: ActivityLog = {
        id: Date.now().toString(),
        action,
        user_id: user.username,
        userRole: user.role,
        type: 'system',
        timestamp: new Date().toISOString(),
        details,
      };
      
      if (APP_CONFIG.features.useBackend) {
        await supabaseService.createActivityLog({
          action,
          user_id: user.username,
          user_role: user.role,
          type: 'system',
          details,
        });
      } else {
        const existingLogs = await AsyncStorage.getItem('activityLogs');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        
        logs.unshift(log);
        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.splice(100);
        }
        
        await AsyncStorage.setItem('activityLogs', JSON.stringify(logs));
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      await logActivity(`Updated stock for product ${products.find(p => p.id === productId)?.name}`, { productId, newStock });
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      // Update product stocks
      for (const item of transaction.items) {
        await updateProductStock(item.product.id, item.product.stock - item.quantity);
      }

      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      await logActivity(`Processed transaction #${newTransaction.id.slice(-6)}`, {
        transactionId: newTransaction.id,
        total: newTransaction.total,
        paymentMethod: newTransaction.paymentMethod,
        itemCount: newTransaction.items.length,
      });
      
      // Create transaction notification
      const notification: Notification = {
        id: (Date.now() + 1).toString(),
        title: 'Transaction Completed',
        message: `Sale of ₱${newTransaction.total.toFixed(2)} processed successfully`,
        type: 'transaction',
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notificationsList = existingNotifications ? JSON.parse(existingNotifications) : [];
      notificationsList.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notificationsList));
      setNotifications(notificationsList);
      
      // Check for low stock after transaction
      await checkLowStock();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.createProduct(product);
        if (result.success && result.data) {
          const updatedProducts = [...products, result.data];
          setProducts(updatedProducts);
          await logActivity(`Added new product: ${result.data.name}`, { productId: result.data.id });
        }
      } else {
        const newProduct: Product = {
          ...product,
          id: Date.now().toString(),
        };

        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        await logActivity(`Added new product: ${newProduct.name}`, { productId: newProduct.id });
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const updatedProducts = products.map(p =>
        p.id === product.id ? product : p
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      await logActivity(`Updated product: ${product.name}`, { productId: product.id });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const productName = products.find(p => p.id === productId)?.name;
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      await logActivity(`Deleted product: ${productName}`, { productId });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      await logActivity(`Added new user: ${newUser.username}`, { userId: newUser.id, role: newUser.role });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      const updatedUsers = users.map(u =>
        u.id === userData.id ? userData : u
      );
      setUsers(updatedUsers);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      await logActivity(`Updated user: ${userData.username}`, { userId: userData.id });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userName = users.find(u => u.id === userId)?.username;
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      await logActivity(`Deleted user: ${userName}`, { userId });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const emailLowStockSuppliers = async () => {
    try {
      const lowStockProducts = getLowStockProducts();
      await logActivity(`Emailed suppliers for ${lowStockProducts.length} low stock products`, {
        productCount: lowStockProducts.length,
        products: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock }))
      });
      
      // Create notification for email sent
      const notification: Notification = {
        id: Date.now().toString(),
        title: 'Suppliers Notified',
        message: `Email sent to suppliers for ${lowStockProducts.length} low stock items`,
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notificationsList = existingNotifications ? JSON.parse(existingNotifications) : [];
      notificationsList.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notificationsList));
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error emailing suppliers:', error);
    }
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(transaction => new Date(transaction.timestamp).toDateString() === today)
      .reduce((total, transaction) => total + transaction.total, 0);
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= 10);
  };

  return (
    <DataContext.Provider value={{
      products,
      transactions,
      users,
      notifications,
      unreadCount,
      updateProductStock,
      addTransaction,
      addProduct,
      updateProduct,
      deleteProduct,
      addUser,
      updateUser,
      deleteUser,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      emailLowStockSuppliers,
      logActivity,
      getTodaysSales,
      getLowStockProducts,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}