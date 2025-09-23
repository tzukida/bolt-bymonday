import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    console.log("Fetching products...");
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error("Supabase fetch error:", error.message);
    } else {
      console.log("Supabase data:", data);
      setProducts(data as Product[]);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error.message);
    } else if (data) {
      setProducts((prev) => [data as Product, ...prev]);
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Error deleting product:", error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

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
