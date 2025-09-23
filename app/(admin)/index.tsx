// app/(admin)/index.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useData } from "../../contexts/DataContext";

export default function DashboardScreen() {
  const { products, getTodaysSales, getLowStockProducts } = useData();

  const todaysSales = getTodaysSales();
  const lowStock = getLowStockProducts();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Today's Sales</Text>
        <Text style={styles.value}>₱{todaysSales.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Low Stock Items</Text>
        {lowStock.length > 0 ? (
          <FlatList
            data={lowStock}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.item}>
                {item.name} — {item.stock} left
              </Text>
            )}
          />
        ) : (
          <Text style={styles.item}>✅ All items have enough stock</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Products</Text>
        <Text style={styles.value}>{products.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  item: {
    fontSize: 14,
    paddingVertical: 3,
  },
});
