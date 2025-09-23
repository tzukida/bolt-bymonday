// contexts/DataContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseService } from "@/services/supabaseService";


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
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getTodaysSales: () => number;
  getLowStockProducts: () => Product[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // --- Fetch all products ---
  const fetchProducts = async () => {
    console.log("DataContext.fetchProducts: fetching...");
    const result = await supabaseService.getProducts();

    if (result.success && result.data) {
      console.log("Products fetched:", result.data.length);
      setProducts(result.data as Product[]);
    } else {
      console.error("Failed to fetch products:", result.error);
    }
  };

  // --- Add product ---
  const addProduct = async (product: Omit<Product, "id">) => {
    console.log("DataContext.addProduct:", product);
    const result = await supabaseService.createProduct(product);

    if (result.success && result.data) {
      setProducts((prev) => [result.data as Product, ...prev]);
    } else {
      console.error("Failed to add product:", result.error);
    }
  };

  // --- Delete product ---
  const deleteProduct = async (id: string) => {
    console.log("DataContext.deleteProduct:", id);
    const result = await supabaseService.deleteProduct(id);

    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      console.error("Failed to delete product:", result.error);
    }
  };

  // --- Extra helpers ---
  const getTodaysSales = () => {
    const today = new Date().toISOString().split("T")[0];
    return products
      .filter((p) => p.created_at?.startsWith(today))
      .reduce((sum, p) => sum + p.price, 0);
  };

  const getLowStockProducts = () => products.filter((p) => p.stock < 10);

  // Load products on mount
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
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
