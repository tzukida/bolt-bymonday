import { supabase } from '@/lib/supabase';

export const transactionService = {
  // Create new transaction
  async createTransaction(transaction: {
    items: Json;
    total: number;
    payment_method: string;
    user_id: string;
  }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get transaction history
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};