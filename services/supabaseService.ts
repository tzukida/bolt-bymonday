// services/supabaseService.ts
import { supabase } from "@/lib/supabase";
import { Product, User, Transaction, ActivityLog, Notification } from "@/context/DataContext";

export const supabaseService = {
  // ---------- PRODUCTS ----------
  getProducts: async () => {
    const { data, error } = await supabase.from("products").select("*");
    return error ? { success: false, error } : { success: true, data };
  },
  createProduct: async (product: Omit<Product, "id">) => {
    const { error } = await supabase.from("products").insert(product);
    return { success: !error, error };
  },
  updateProduct: async (id: string, product: Partial<Product>) => {
    const { error } = await supabase.from("products").update(product).eq("id", id);
    return { success: !error, error };
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return { success: !error, error };
  },

  // ---------- USERS ----------
  getUsers: async () => {
    const { data, error } = await supabase.from("users").select("*");
    return error ? { success: false, error } : { success: true, data };
  },
  createUser: async (user: Omit<User, "id">) => {
    const { error } = await supabase.from("users").insert(user);
    return { success: !error, error };
  },
  deleteUser: async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    return { success: !error, error };
  },

  // ---------- TRANSACTIONS ----------
  getTransactions: async () => {
    const { data, error } = await supabase.from("transactions").select("*");
    return error ? { success: false, error } : { success: true, data };
  },
  createTransaction: async (transaction: Omit<Transaction, "id">) => {
    const { error } = await supabase.from("transactions").insert(transaction);
    return { success: !error, error };
  },

  // ---------- ACTIVITY LOGS ----------
  getActivityLogs: async () => {
    const { data, error } = await supabase.from("activity_logs").select("*");
    return error ? { success: false, error } : { success: true, data };
  },
  createActivityLog: async (message: string) => {
    const log: ActivityLog = { id: Date.now().toString(), message, created_at: new Date().toISOString() };
    const { error } = await supabase.from("activity_logs").insert(log);
    return { success: !error, error };
  },

  // ---------- NOTIFICATIONS ----------
  getNotifications: async () => {
    const { data, error } = await supabase.from("notifications").select("*");
    return error ? { success: false, error } : { success: true, data };
  },
  createNotification: async (message: string) => {
    const notif: Notification = { id: Date.now().toString(), message, created_at: new Date().toISOString() };
    const { error } = await supabase.from("notifications").insert(notif);
    return { success: !error, error };
  },
};
