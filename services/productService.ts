import { supabase } from '@/lib/supabase';

export const productService = {
  // Get all products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update product stock
  async updateStock(productId: string, newStock: number) {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: newStock, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create new product
  async createProduct(product: {
    name: string;
    price: number;
    stock?: number;
    image?: string;
    category?: string;
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};