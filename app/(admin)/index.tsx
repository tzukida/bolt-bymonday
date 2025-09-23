// app/(admin)/index.tsx
import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useData } from "@/contexts/DataContext";

export default function AdminIndex() {
  const router = useRouter();
  const { products, users, transactions, todaysSales, low, refreshData } = useData();

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">📊 Admin Dashboard</Text>

      {/* Sales Today */}
      <View className="mb-4 p-4 bg-green-100 rounded-2xl shadow">
        <Text className="text-lg font-semibold">Today's Sales</Text>
        <Text className="text-2xl font-bold text-green-700">₱{todaysSales}</Text>
      </View>

      {/* Stats Grid */}
      <View className="grid grid-cols-2 gap-4">
        <TouchableOpacity
          className="p-4 bg-blue-100 rounded-2xl shadow"
          onPress={() => router.push("/(admin)/products")}
        >
          <Text className="text-lg font-semibold">Products</Text>
          <Text className="text-xl font-bold text-blue-700">{products.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 bg-purple-100 rounded-2xl shadow"
          onPress={() => router.push("/(admin)/users")}
        >
          <Text className="text-lg font-semibold">Users</Text>
          <Text className="text-xl font-bold text-purple-700">{users.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 bg-yellow-100 rounded-2xl shadow"
          onPress={() => router.push("/(admin)/transactions")}
        >
          <Text className="text-lg font-semibold">Transactions</Text>
          <Text className="text-xl font-bold text-yellow-700">{transactions.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-4 bg-red-100 rounded-2xl shadow"
          onPress={() => router.push("/(admin)/low-stock")}
        >
          <Text className="text-lg font-semibold">Low Stock</Text>
          <Text className="text-xl font-bold text-red-700">{low}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
