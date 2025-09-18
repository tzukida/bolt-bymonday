import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface DataContextType {
  products: Product[];
  transactions: Transaction[];
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getTodaysSales: () => number;
  getLowStockProducts: () => Product[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

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
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products
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
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts(SAMPLE_PRODUCTS);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
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
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
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
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Error deleting product:', error);
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
      updateProductStock,
      addTransaction,
      addProduct,
      updateProduct,
      deleteProduct,
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