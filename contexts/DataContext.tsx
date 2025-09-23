import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/app';

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  created_at?: string;
};

type DataContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  emailLowStockSuppliers: () => Promise<void>;
  getLowStockProducts: () => Product[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    refreshProducts();
  }, []);

  // ✅ Fetch products directly from Supabase
  const refreshProducts = async () => {
    if (APP_CONFIG.features.useBackend) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error.message);
      } else {
        console.log('Fetched products:', data); // debug log
        setProducts(data || []);
      }
    } else {
      try {
        const localProducts = await AsyncStorage.getItem('products');
        setProducts(localProducts ? JSON.parse(localProducts) : []);
      } catch (error) {
        console.error('Error loading products from storage:', error);
      }
    }
  };

  // ✅ Add product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (APP_CONFIG.features.useBackend) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) {
        console.error('Supabase insert error:', error.message);
        throw error;
      } else if (data) {
        setProducts((prev) => [data[0], ...prev]);
      }
    } else {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };
      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  // ✅ Update product
  const updateProduct = async (product: Product) => {
    if (APP_CONFIG.features.useBackend) {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.image,
          category: product.category,
        })
        .eq('id', product.id);

      if (error) {
        console.error('Supabase update error:', error.message);
        throw error;
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? product : p))
        );
      }
    } else {
      const updatedProducts = products.map((p) =>
        p.id === product.id ? product : p
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  // ✅ Delete product
  const deleteProduct = async (id: string) => {
    if (APP_CONFIG.features.useBackend) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error.message);
        throw error;
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } else {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  // ✅ Email suppliers (mock for now)
  const emailLowStockSuppliers = async () => {
    const lowStock = getLowStockProducts();
    console.log('Pretend email sent for:', lowStock);
    return Promise.resolve();
  };

  const getLowStockProducts = () => {
    return products.filter((p) => p.stock <= 10);
  };

  return (
    <DataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        emailLowStockSuppliers,
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
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
