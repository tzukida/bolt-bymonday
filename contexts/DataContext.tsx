import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { APP_CONFIG } from '@/config/app';

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
  user_id: string;
  user_role: string;
  type: string;
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
  activityLogs: ActivityLog[];
  unreadCount: number;
  isLoading: boolean;
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
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(checkLowStock, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (APP_CONFIG.features.useBackend) {
        // Load from Supabase
        console.log('Loading data from Supabase...');
        const [productsResult, transactionsResult, usersResult, notificationsResult, activityLogsResult] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getTransactions(),
          supabaseService.getUsers(),
          supabaseService.getNotifications(),
          supabaseService.getActivityLogs()
        ]);

        if (productsResult.success && productsResult.data) {
          console.log('Products loaded:', productsResult.data.length);
          setProducts(productsResult.data);
        } else {
          console.error('Failed to load products:', productsResult.error);
          setProducts(SAMPLE_PRODUCTS);
        }

        if (transactionsResult.success && transactionsResult.data) {
          console.log('Transactions loaded:', transactionsResult.data.length);
          // Transform transactions to match our interface
          const transformedTransactions = transactionsResult.data.map((t: any) => ({
            ...t,
            timestamp: t.created_at,
            userId: t.user_id
          }));
          setTransactions(transformedTransactions);
        } else {
          console.error('Failed to load transactions:', transactionsResult.error);
          setTransactions([]);
        }

        if (usersResult.success && usersResult.data) {
          console.log('Users loaded:', usersResult.data.length);
          setUsers(usersResult.data);
        } else {
          console.error('Failed to load users:', usersResult.error);
          setUsers(SAMPLE_USERS);
        }

        if (notificationsResult.success && notificationsResult.data) {
          console.log('Notifications loaded:', notificationsResult.data.length);
          // Transform notifications to match our interface
          const transformedNotifications = notificationsResult.data.map((n: any) => ({
            ...n,
            timestamp: n.created_at
          }));
          setNotifications(transformedNotifications);
        } else {
          console.error('Failed to load notifications:', notificationsResult.error);
          setNotifications([]);
        }

        if (activityLogsResult.success && activityLogsResult.data) {
          console.log('Activity logs loaded:', activityLogsResult.data.length);
          // Transform activity logs to match our interface
          const transformedLogs = activityLogsResult.data.map((log: any) => ({
            ...log,
            timestamp: log.created_at,
            userId: log.user_id,
            userRole: log.user_role
          }));
          setActivityLogs(transformedLogs);
        } else {
          console.error('Failed to load activity logs:', activityLogsResult.error);
          setActivityLogs([]);
        }
      } else {
        // Load from local storage
        console.log('Loading data from local storage...');
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

        // Load activity logs
        const activityLogsData = await AsyncStorage.getItem('activityLogs');
        if (activityLogsData) {
          setActivityLogs(JSON.parse(activityLogsData));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts(SAMPLE_PRODUCTS);
      setUsers(SAMPLE_USERS);
      setTransactions([]);
      setNotifications([]);
      setActivityLogs([]);
    } finally {
      setIsLoading(false);
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
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.createActivityLog({
          action,
          user_id: user.username,
          user_role: user.role,
          type: 'system',
          details,
        });
        
        if (result.success && result.data) {
          const transformedLog = {
            ...result.data,
            timestamp: result.data.created_at,
            userId: result.data.user_id,
            userRole: result.data.user_role
          };
          setActivityLogs(prev => [transformedLog, ...prev.slice(0, 99)]);
        }
      } else {
        const log: ActivityLog = {
          id: Date.now().toString(),
          action,
          user_id: user.username,
          user_role: user.role,
          type: 'system',
          timestamp: new Date().toISOString(),
          details,
        };
        
        const existingLogs = await AsyncStorage.getItem('activityLogs');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        
        logs.unshift(log);
        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.splice(100);
        }
        
        await AsyncStorage.setItem('activityLogs', JSON.stringify(logs));
        setActivityLogs(logs);
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
      if (APP_CONFIG.features.useBackend) {
        // Create transaction in Supabase
        const result = await supabaseService.createTransaction({
          items: transaction.items,
          total: transaction.total,
          payment_method: transaction.paymentMethod,
          user_id: transaction.userId,
        });

        if (result.success && result.data) {
          const newTransaction: Transaction = {
            ...result.data,
            id: result.data.id,
            timestamp: result.data.created_at,
            paymentMethod: result.data.payment_method,
            userId: result.data.user_id,
          };

          // Update product stocks in Supabase
          for (const item of transaction.items) {
            const updatedProduct = {
              ...item.product,
              stock: item.product.stock - item.quantity
            };
            await supabaseService.updateProduct(item.product.id, updatedProduct);
          }

          // Refresh products from database
          const productsResult = await supabaseService.getProducts();
          if (productsResult.success && productsResult.data) {
            setProducts(productsResult.data);
          }

          setTransactions(prev => [newTransaction, ...prev]);
          
          await logActivity(`Processed transaction #${newTransaction.id.slice(-6)}`, {
            transactionId: newTransaction.id,
            total: newTransaction.total,
            paymentMethod: newTransaction.paymentMethod,
            itemCount: newTransaction.items.length,
          });
        }
      } else {
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
      }
      
      // Create transaction notification
      const notification: Notification = {
        id: Date.now().toString() + '_notif',
        title: 'Transaction Completed',
        message: `Sale of ₱${transaction.total.toFixed(2)} processed successfully`,
        type: 'transaction',
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      if (APP_CONFIG.features.useBackend) {
        await supabaseService.createNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
        });
        // Refresh notifications
        const notificationsResult = await supabaseService.getNotifications();
        if (notificationsResult.success && notificationsResult.data) {
          const transformedNotifications = notificationsResult.data.map((n: any) => ({
            ...n,
            timestamp: n.created_at
          }));
          setNotifications(transformedNotifications);
        }
      } else {
        const existingNotifications = await AsyncStorage.getItem('notifications');
        const notificationsList = existingNotifications ? JSON.parse(existingNotifications) : [];
        notificationsList.unshift(notification);
        await AsyncStorage.setItem('notifications', JSON.stringify(notificationsList));
        setNotifications(notificationsList);
      }
      
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
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.updateProduct(product.id, product);
        if (result.success && result.data) {
          const updatedProducts = products.map(p =>
            p.id === product.id ? result.data : p
          );
          setProducts(updatedProducts);
          await logActivity(`Updated product: ${result.data.name}`, { productId: result.data.id });
        }
      } else {
        const updatedProducts = products.map(p =>
          p.id === product.id ? product : p
        );
        setProducts(updatedProducts);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        await logActivity(`Updated product: ${product.name}`, { productId: product.id });
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const productName = products.find(p => p.id === productId)?.name;
      
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.deleteProduct(productId);
        if (result.success) {
          const updatedProducts = products.filter(p => p.id !== productId);
          setProducts(updatedProducts);
          await logActivity(`Deleted product: ${productName}`, { productId });
        }
      } else {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        await logActivity(`Deleted product: ${productName}`, { productId });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.createUser(userData);
        if (result.success && result.data) {
          const updatedUsers = [...users, result.data];
          setUsers(updatedUsers);
          await logActivity(`Added new user: ${result.data.username}`, { userId: result.data.id, role: result.data.role });
        }
      } else {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        await logActivity(`Added new user: ${newUser.username}`, { userId: newUser.id, role: newUser.role });
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.updateUser(userData.id, userData);
        if (result.success && result.data) {
          const updatedUsers = users.map(u =>
            u.id === userData.id ? result.data : u
          );
          setUsers(updatedUsers);
          await logActivity(`Updated user: ${result.data.username}`, { userId: result.data.id });
        }
      } else {
        const updatedUsers = users.map(u =>
          u.id === userData.id ? userData : u
        );
        setUsers(updatedUsers);
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        await logActivity(`Updated user: ${userData.username}`, { userId: userData.id });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userName = users.find(u => u.id === userId)?.username;
      
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.deleteUser(userId);
        if (result.success) {
          const updatedUsers = users.filter(u => u.id !== userId);
          setUsers(updatedUsers);
          await logActivity(`Deleted user: ${userName}`, { userId });
        }
      } else {
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        await logActivity(`Deleted user: ${userName}`, { userId });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.markNotificationAsRead(notificationId);
        if (result.success) {
          const updatedNotifications = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          setNotifications(updatedNotifications);
        }
      } else {
        const updatedNotifications = notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.markAllNotificationsAsRead();
        if (result.success) {
          const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
          setNotifications(updatedNotifications);
        }
      } else {
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
        await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
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
      activityLogs,
      unreadCount,
      isLoading,
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