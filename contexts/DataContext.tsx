import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/app';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

type DataContextType = {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getTodaysSales: () => number;
  getLowStockProducts: () => Product[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    if (APP_CONFIG.features.useBackend) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setProducts(data as Product[]);
    } else {
      const stored = await AsyncStorage.getItem('products');
      if (stored) setProducts(JSON.parse(stored));
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => { /* same as before */ };
  const deleteProduct = async (id: string) => { /* same as before */ };

  // --- Extra helpers ---
  const getTodaysSales = () => {
    const today = new Date().toISOString().split('T')[0];
    return products
      .filter((p) => p.created_at?.startsWith(today))
      .reduce((sum, p) => sum + p.price, 0);
  };

  const getLowStockProducts = () => products.filter((p) => p.stock < 10);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        fetchProducts,
        addProduct,
        deleteProduct,
        getTodaysSales,
        getLowStockProducts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
