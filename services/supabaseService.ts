
import { supabase } from "@/lib/supabase";
import type { Product, User, Transaction, ActivityLog, Notification } from "@/contexts/DataContext";

export const supabaseService = {
  // --- PRODUCTS ---
  async getProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async createProduct(product: Product) {
    const { error } = await supabase.from("products").insert(product);
    return { success: !error, error };
  },
  async updateProduct(id: string, product: Partial<Product>) {
    const { error } = await supabase.from("products").update(product).eq("id", id);
    return { success: !error, error };
  },
  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return { success: !error, error };
  },

  // --- USERS ---
  async getUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async createUser(user: User) {
    const { error } = await supabase.from("users").insert(user);
    return { success: !error, error };
  },
  async updateUser(id: string, user: Partial<User>) {
    const { error } = await supabase.from("users").update(user).eq("id", id);
    return { success: !error, error };
  },
  async deleteUser(id: string) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    return { success: !error, error };
  },

  // --- TRANSACTIONS ---
  async getTransactions() {
    const { data, error } = await supabase.from("transactions").select("*");
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async createTransaction(transaction: Transaction) {
    const { error } = await supabase.from("transactions").insert(transaction);
    return { success: !error, error };
  },

  // --- ACTIVITY LOGS ---
  async getActivityLogs() {
    const { data, error } = await supabase.from("activity_logs").select("*");
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async createActivityLog(log: ActivityLog) {
    const { error } = await supabase.from("activity_logs").insert(log);
    return { success: !error, error };
  },
  
  // --- LOGIN ---
  async login(username: string, password: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();
    
    if (error) return { success: false, error };
    return { success: true, data };
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    const { data, error } = await supabase.from("notifications").select("*");
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async createNotification(notification: Notification) {
    const { error } = await supabase.from("notifications").insert(notification);
    return { success: !error, error };
  },
  async markNotificationAsRead(id: string) {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    return { success: !error, error };
  },
  async markAllNotificationsAsRead() {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
    return { success: !error, error };
  },
};
