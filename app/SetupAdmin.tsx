import { useEffect } from "react";
import { supabaseService } from "@/services/supabaseService";

export default function SetupAdmin() {
  useEffect(() => {
    const createAdmin = async () => {
      const res = await supabaseService.signup("admin@bymonday.com", "admin123", { 
        role: "admin", 
        username: "admin" 
      });
      console.log("Admin setup result:", res);
    };

    createAdmin();
  }, []);

  return null; // or show "Setting up admin..."
}
