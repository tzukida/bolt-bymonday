// context/DataContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseService } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/appConfig';
import { Database } from '@/types/database';
import { SAMPLE_PRODUCTS, SAMPLE_USERS } from '@/lib/sampleData';

type Product = Database['public']['Tables']['products']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

type DataContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  loadData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadData = async () => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const [productsRes, transactionsRes, usersRes, notificationsRes] =
          await Promise.all([
            supabaseService.getProducts(),
            supabaseService.getTransactions(),
            supabaseService.getUsers(),
            supabaseService.getNotifications(),
          ]);

        if (productsRes.success) setProducts(productsRes.data || []);
        if (transactionsRes.success) setTransactions(transactionsRes.data || []);
        if (usersRes.success) setUsers(usersRes.data || []);
        if (notificationsRes.success)
          setNotifications(notificationsRes.data || []);
      } else {
        // Local storage fallback
        const productsData = await AsyncStorage.getItem('products');
        if (productsData) {
          setProducts(JSON.parse(productsData));
        } else {
          await AsyncStorage.setItem('products', JSON.stringify(SAMPLE_PRODUCTS));
          setProducts(SAMPLE_PRODUCTS);
        }

        const transactionsData = await AsyncStorage.getItem('transactions');
        if (transactionsData) setTransactions(JSON.parse(transactionsData));

        const usersData = await AsyncStorage.getItem('users');
        if (usersData) {
          setUsers(JSON.parse(usersData));
        } else {
          await AsyncStorage.setItem('users', JSON.stringify(SAMPLE_USERS));
          setUsers(SAMPLE_USERS);
        }

        const notificationsData = await AsyncStorage.getItem('notifications');
        if (notificationsData) setNotifications(JSON.parse(notificationsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts(SAMPLE_PRODUCTS);
      setUsers(SAMPLE_USERS);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        setProducts,
        transactions,
        setTransactions,
        users,
        setUsers,
        notifications,
        setNotifications,
        loadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
