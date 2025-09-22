import { supabase } from '@/lib/supabase';

export const userService = {
  // Login user
  async login(username: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create new user
  async createUser(user: {
    username: string;
    password: string;
    role: 'admin' | 'staff';
    email?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};