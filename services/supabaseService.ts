import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

// Types from generated Supabase types
type User = Database['public']['Tables']['users']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export class SupabaseService {
  // ----------------------
  // 🔑 Authentication
  // ----------------------
  async login(username: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('username', username)
      .eq('password', password);

    if (error || !data || data.length === 0) {
      console.log('Login failed:', error);
      return { success: false, data: null };
    }

    return { success: true, data: data[0] as User };
  }

  // ----------------------
  // 👤 Users
  // ----------------------
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data as User[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createUser(userData: Database['public']['Tables']['users']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as User };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateUser(id: string, userData: Database['public']['Tables']['users']['Update']) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as User };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteUser(id: string) {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ----------------------
  // 📦 Products
  // ----------------------
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data as Product[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createProduct(productData: Database['public']['Tables']['products']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Product };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateProduct(id: string, productData: Database['public']['Tables']['products']['Update']) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Product };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteProduct(id: string) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ----------------------
  // 💰 Transactions
  // ----------------------
  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data as Transaction[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createTransaction(transactionData: Database['public']['Tables']['transactions']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Transaction };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ----------------------
  // 📝 Activity Logs
  // ----------------------
  async getActivityLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return { success: true, data: data as ActivityLog[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createActivityLog(logData: Database['public']['Tables']['activity_logs']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert(logData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as ActivityLog };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ----------------------
  // 🔔 Notifications
  // ----------------------
  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data as Notification[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createNotification(notificationData: Database['public']['Tables']['notifications']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Notification };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async markNotificationAsRead(id: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Notification };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)
        .select();

      if (error) throw error;
      return { success: true, data: data as Notification[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// Export a singleton instance
export const supabaseService = new SupabaseService();
