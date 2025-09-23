import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/services/supabaseService';
import { APP_CONFIG } from '@/config/app';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  created_at?: string;
}

interface DataContextType {
  products: Product[];
  getLowStockProducts: () => Product[];
  getTodaysSales: () => number;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  emailLowStockSuppliers: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  // ✅ Fetch products on mount + set up realtime listener
  useEffect(() => {
    refreshProducts();

    if (APP_CONFIG.features.useBackend) {
      const channel = supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            refreshProducts(); // ✅ auto-refresh when DB changes
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // ✅ Fetch products (source of truth)
  const refreshProducts = async () => {
    if (APP_CONFIG.features.useBackend) {
      const productsResult = await supabaseService.getProducts();
      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data);
      } else {
        console.error('Failed to refresh products:', productsResult.error);
      }
    } else {
      try {
        const localProducts = await AsyncStorage.getItem('products');
        setProducts(localProducts ? JSON.parse(localProducts) : []);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
  };

  // ✅ Add Product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.createProduct(product);
        if (result.success) {
          await refreshProducts();
          await logActivity(`Added new product: ${product.name}`, { productId: result.data.id });
        }
      } else {
        const newProduct = { ...product, id: Date.now().toString() };
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        await logActivity(`Added new product: ${product.name}`, { productId: newProduct.id });
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // ✅ Update Product
  const updateProduct = async (product: Product) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.updateProduct(product.id, product);
        if (result.success) {
          await refreshProducts();
          await logActivity(`Updated product: ${product.name}`, { productId: product.id });
        }
      } else {
        const updatedProducts = products.map(p => (p.id === product.id ? product : p));
        setProducts(updatedProducts);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        await logActivity(`Updated product: ${product.name}`, { productId: product.id });
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // ✅ Delete Product
  const deleteProduct = async (productId: string) => {
    try {
      if (APP_CONFIG.features.useBackend) {
        const result = await supabaseService.deleteProduct(productId);
        if (result.success) {
          await refreshProducts();
          await logActivity(`Deleted product: ${productId}`, { productId });
        }
      } else {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        await logActivity(`Deleted product: ${productId}`, { productId });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // ✅ Helpers
  const getLowStockProducts = () => products.filter(p => p.stock <= 10);

  const getTodaysSales = () => {
    // placeholder (depends on sales schema)
    return 0;
  };

  const emailLowStockSuppliers = async () => {
    console.log('Sending email for:', getLowStockProducts());
  };

  // ✅ Activity Logger
  const logActivity = async (action: string, details?: Record<string, any>) => {
    if (APP_CONFIG.features.useBackend) {
      try {
        await supabaseService.createActivityLog({
          action,
          type: 'inventory',
          details,
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    } else {
      console.log('Activity Log:', { action, details, timestamp: new Date().toISOString() });
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        getLowStockProducts,
        getTodaysSales,
        addProduct,
        updateProduct,
        deleteProduct,
        emailLowStockSuppliers,
        refreshProducts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
