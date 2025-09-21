import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { LogOut, Package, TriangleAlert as AlertTriangle, DollarSign, Coffee } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { products, getTodaysSales, getLowStockProducts } = useData();
  const router = useRouter();

  const todaysSales = getTodaysSales();
  const lowStockProducts = getLowStockProducts();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const DashboardCard = ({ title, value, subtitle, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Icon size={24} color={color} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.role}>Staff Member</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Today's Sales"
            value={`₱${todaysSales.toFixed(2)}`}
            subtitle="Total revenue today"
            icon={DollarSign}
            color="#228B22"
            onPress={() => {}}
          />

          <DashboardCard
            title="Low Stock Alerts"
            value={lowStockProducts.length}
            subtitle={lowStockProducts.length > 0 ? 'Items need restocking' : 'All items well stocked'}
            icon={AlertTriangle}
            color={lowStockProducts.length > 0 ? '#FF6347' : '#228B22'}
            onPress={() => router.push('/(staff)/notifications')}
          />

          <DashboardCard
            title="Point of Sale"
            value="Ready"
            subtitle="Process new orders"
            icon={Coffee}
            color="#8B4513"
            onPress={() => router.push('/(staff)/pos')}
          />
        </View>

        {lowStockProducts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
            {lowStockProducts.slice(0, 3).map(product => (
              <View key={product.id} style={styles.alertCard}>
                <AlertTriangle size={20} color="#FF6347" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{product.name}</Text>
                  <Text style={styles.alertSubtitle}>Only {product.stock} left</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(staff)/pos')}
            >
              <Coffee size={24} color="#8B4513" />
              <Text style={styles.actionText}>Start POS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(staff)/notifications')}
            >
              <AlertTriangle size={24} color="#8B4513" />
              <Text style={styles.actionText}>View Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: '#F5F5DC',
    fontSize: 16,
  },
  username: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  role: {
    color: '#DEB887',
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#A0522D',
    padding: 12,
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
    marginTop: 8,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  alertsSection: {
    marginTop: 24,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quickActions: {
    marginTop: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'center',
  },
});