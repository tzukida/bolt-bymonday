import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/app';

// --- Types ---
export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
};

type DataContextType = {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Provider ---
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch Products
  const fetchProducts = async () => {
    if (APP_CONFIG.features.useBackend) {
      // ✅ Supabase
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Supabase fetch error:', error);
      } else {
        setProducts(data as Product[]);
      }
    } else {
      // ✅ Local Storage (for offline testing)
      const stored = await AsyncStorage.getItem('products');
      if (stored) {
        setProducts(JSON.parse(stored));
      }
    }
  };

  // Add Product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (APP_CONFIG.features.useBackend) {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product }])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
      } else {
        setProducts((prev) => [...prev, ...(data as Product[])]);
      }
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...product,
      };
      const updated = [...products, newProduct];
      setProducts(updated);
      await AsyncStorage.setItem('products', JSON.stringify(updated));
    }
  };

  // Delete Product
  const deleteProduct = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } else {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      await AsyncStorage.setItem('products', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <DataContext.Provider value={{ products, fetchProducts, addProduct, deleteProduct }}>
      {children}
    </DataContext.Provider>
  );
};

// --- Hook ---
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
