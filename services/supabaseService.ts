import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export class SupabaseService {
  constructor() {
    this.testConnection();
  }

  async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
      } else {
        console.log('Supabase connection successful');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  }
  // services/supabaseServices.ts - Updated login method
  async login(username: string, password: string) {
    try {
      console.log('Attempting login for user:', username);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
  
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('User not found or invalid credentials');
      }
      
      console.log('Login successful for user:', data.username);
      return { success: true, data };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: (error as Error).message || 'Login failed' 
      };
    }
  }

  // Add this to your SupabaseService for testing
  async testUserQuery() {
    try {
      console.log('Testing user query...');
      
      // First, check if we can access the users table at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, username')
        .limit(5);
  
      if (allUsersError) {
        console.error('Error fetching users:', allUsersError);
        return;
      }
      
      console.log('All users in database:', allUsers);
      
      // Test with specific credentials
      const testUsername = 'testuser'; // Change to a known username
      const testPassword = 'testpass'; // Change to known password
      
      const { data: testUser, error: testError } = await supabase
        .from('users')
        .select('*')
        .eq('username', testUsername)
        .eq('password', testPassword)
        .single();
  
      console.log('Test login result:', { testUser, testError });
      
    } catch (error) {
      console.error('Test query error:', error);
    }
  }

// Call this somewhere in your app to test

  // Users
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
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
      return { success: true, data };
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
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Products
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
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
      return { success: true, data };
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
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Transactions
  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
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
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Activity Logs
  async getActivityLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return { success: true, data };
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
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Notifications
  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
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
      return { success: true, data };
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
      return { success: true, data };
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
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const supabaseService = new SupabaseService();