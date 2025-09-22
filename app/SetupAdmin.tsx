import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { supabaseService } from "@/services/supabaseService";
import { useRouter } from "expo-router";

export default function SetupAdmin() {
  const [status, setStatus] = useState("Creating admin...");
  const router = useRouter();

  useEffect(() => {
    const createAdmin = async () => {
      const res = await supabaseService.signup("admin@bymonday.com", "admin123", {
        role: "admin",
        username: "admin",
      });

      if (res.success) {
        setStatus("✅ Admin created! Redirecting to login...");
        setTimeout(() => {
          router.replace("/login"); // auto go to login screen
        }, 2000);
      } else {
        setStatus("❌ Error: " + res.error);
      }
    };

    createAdmin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 20 }}>{status}</Text>
    </View>
  );
}
