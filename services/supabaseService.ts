// services/SupabaseService.ts
import { supabase } from "@/lib/supabase";

class SupabaseService {
  // 🔹 Fetch all products
  async getProducts() {
    try {
      console.log("Fetching products...");
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error.message);
        return [];
      }

      console.log("Products fetched:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching products:", err);
      return [];
    }
  }

  // 🔹 Fetch all users
  async getUsers() {
    try {
      console.log("Fetching users...");
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error.message);
        return [];
      }

      console.log("Users fetched:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
      return [];
    }
  }

  // 🔹 Create a transaction
  async createTransaction(transaction: {
    product_id: string;
    quantity: number;
    total_price: number;
    user_id: string;
  }) {
    try {
      console.log("Creating transaction with:", transaction);

      const { data, error } = await supabase
        .from("transactions")
        .insert([transaction])
        .select()
        .maybeSingle(); // ✅ return inserted row or null

      if (error) {
        console.error("Transaction insert error:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.warn("Transaction insert returned no data");
        return { success: false, error: "No data returned after insert" };
      }

      console.log("Transaction created:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Transaction failed:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // 🔹 Get today’s sales (simple example)
  async getTodaysSales() {
    try {
      console.log("Fetching today’s sales...");
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      if (error) {
        console.error("Error fetching today’s sales:", error.message);
        return [];
      }

      console.log("Today’s sales fetched:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching today’s sales:", err);
      return [];
    }
  }

  // 🔹 Get low stock products
  async getLowStockProducts(threshold = 10) {
    try {
      console.log(`Fetching low stock products (qty < ${threshold})...`);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lt("quantity", threshold);

      if (error) {
        console.error("Error fetching low stock products:", error.message);
        return [];
      }

      console.log("Low stock products fetched:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching low stock products:", err);
      return [];
    }
  }
}

export const supabaseService = new SupabaseService();
