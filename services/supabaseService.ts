// services/supabaseServices.ts
import { supabase } from "../lib/supabase";

export const supabaseServices = {
  // ✅ Count products
  async getProducts(): Promise<number> {
    console.log("supabaseServices.getProducts()");
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching products:", error);
      return 0;
    }
    return count ?? 0;
  },

  // ✅ Count low stock (qty < 10)
  async getLowStock(): Promise<number> {
    console.log("supabaseServices.getLowStock()");
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("quantity", 10);

    if (error) {
      console.error("Error fetching low stock:", error);
      return 0;
    }
    return count ?? 0;
  },

  // ✅ Count users
  async getUsers(): Promise<number> {
    console.log("supabaseServices.getUsers()");
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching users:", error);
      return 0;
    }
    return count ?? 0;
  },

  // ✅ Count transactions
  async getTransactions(): Promise<number> {
    console.log("supabaseServices.getTransactions()");
    const { count, error } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching transactions:", error);
      return 0;
    }
    return count ?? 0;
  },

  // ✅ Get today's sales total
  async getTodaysSales(): Promise<number> {
    console.log("supabaseServices.getTodaysSales()");
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, created_at")
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`);

    if (error) {
      console.error("Error fetching today's sales:", error);
      return 0;
    }

    const total = data?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;
    return total;
  },

  // ✅ Example unread count (notifications table)
  async getUnreadCount(): Promise<number> {
    console.log("supabaseServices.getUnreadCount()");
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (error) {
      console.error("Error fetching unread notifications:", error);
      return 0;
    }
    return count ?? 0;
  },
};
