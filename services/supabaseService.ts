// src/services/supabaseService.ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbTransaction = Database['public']['Tables']['transactions']['Row'];
type DbUser = Database['public']['Tables']['users']['Row'];

export class SupabaseService {
  // PRODUCTS
  async getProducts(): Promise<DbProduct[]> {
    try {
      console.log('SupabaseService.getProducts()');
      const { data, error } = await supabase
        .from<DbProduct>('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.error('Unexpected getProducts error:', err);
      return [];
    }
  }

  // USERS (simple fetch)
  async getUsers(): Promise<DbUser[]> {
    try {
      const { data, error } = await supabase
        .from<DbUser>('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.error('Unexpected getUsers error:', err);
      return [];
    }
  }

  // TRANSACTIONS
  async getTransactions(): Promise<DbTransaction[]> {
    try {
      const { data, error } = await supabase
        .from<DbTransaction>('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.error('Unexpected getTransactions error:', err);
      return [];
    }
  }

  // createTransaction - adjust payload to match your DB schema
  async createTransaction(payload: Partial<DbTransaction>) {
    try {
      console.log('SupabaseService.createTransaction payload:', payload);

      const { data, error } = await supabase
        .from<DbTransaction>('transactions')
        .insert([payload])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Transaction insert error:', error);
        return { success: false, error: error.message };
      }
      if (!data) {
        console.warn('Transaction insert returned no row');
        return { success: false, error: 'No data returned' };
      }

      console.log('Transaction created:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Unexpected createTransaction error:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  // getTodaysTransactions (helper)
  async getTodaysTransactions(): Promise<DbTransaction[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const start = `${today}T00:00:00`;
      const end = `${today}T23:59:59`;

      const { data, error } = await supabase
        .from<DbTransaction>('transactions')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) {
        console.error('Error fetching today transactions:', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.error('Unexpected getTodaysTransactions error:', err);
      return [];
    }
  }

  // getTodaysSales -> returns numeric total (this is the function your UI expects)
  async getTodaysSales(): Promise<number> {
    try {
      const tx = await this.getTodaysTransactions();
      // Adjust the field name for total depending on your schema (e.g. total, total_price)
      const total = tx.reduce((sum, t) => {
        // try several possible total field names
        const tTotal = (t as any).total ?? (t as any).total_price ?? (t as any).amount ?? 0;
        return sum + Number(tTotal || 0);
      }, 0);
      return total;
    } catch (err) {
      console.error('Error calculating todays sales:', err);
      return 0;
    }
  }

  // low-stock
  async getLowStockProducts(threshold = 10): Promise<DbProduct[]> {
    try {
      const { data, error } = await supabase
        .from<DbProduct>('products')
        .select('*')
        .lte('stock', threshold)
        .order('stock', { ascending: true });

      if (error) {
        console.error('Error fetching low stock:', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.error('Unexpected getLowStockProducts error:', err);
      return [];
    }
  }

  // login (safe)
  async login(username: string, password: string) {
    try {
      console.log('SupabaseService.login:', username);
      const { data, error } = await supabase
        .from<DbUser>('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }
      if (!data) {
        return { success: false, error: 'Invalid username or password' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Unexpected login error:', err);
      return { success: false, error: (err as Error).message };
    }
  }
}

export const supabaseService = new SupabaseService();
