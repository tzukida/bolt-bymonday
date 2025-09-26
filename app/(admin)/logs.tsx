import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, User, ShoppingCart, Package, Mail, Settings } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
    case 'logout':
      return <User size={20} color="#8B4513" />;
    case 'transaction':
      return <ShoppingCart size={20} color="#228B22" />;
    case 'inventory':
      return <Package size={20} color="#FF8C00" />;
    case 'email':
      return <Mail size={20} color="#4169E1" />;
    case 'user_management':
      return <Settings size={20} color="#DC143C" />;
    default:
      return <Clock size={20} color="#8B4513" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'login':
    case 'logout':
      return '#E6F3FF';
    case 'transaction':
      return '#E6FFE6';
    case 'inventory':
      return '#FFF4E6';
    case 'email':
      return '#F0F8FF';
    case 'user_management':
      return '#FFE6E6';
    default:
      return '#F5F5DC';
  }
};

export default function ActivityLogs() {
  const { activityLogs, isLoading } = useData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Logs</Text>
        <Text style={styles.subtitle}>System activity and user actions</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#D2B48C" />
            <Text style={styles.emptyTitle}>Loading...</Text>
            <Text style={styles.emptySubtitle}>
              Fetching activity logs...
            </Text>
          </View>
        ) : activityLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#D2B48C" />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptySubtitle}>
              User activities and system events will appear here
            </Text>
          </View>
        ) : (
          activityLogs.map((log) => (
            <TouchableOpacity
              key={log.id}
              style={[
                styles.logItem,
                { backgroundColor: getActivityColor(log.type) }
              ]}
            >
              <View style={styles.logHeader}>
                <View style={styles.iconContainer}>
                  {getActivityIcon(log.type)}
                </View>
                <View style={styles.logContent}>
                  <Text style={styles.logAction}>{log.action}</Text>
                  <Text style={styles.logUser}>by {log.user_id} ({log.user_role})</Text>
                </View>
                <Text style={styles.logTime}>
                  {formatDate(log.created_at)}
                </Text>
              </View>
              {log.details && (
                <Text style={styles.logDetails}>
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    padding: 20,
    backgroundColor: '#8B4513',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#F5F5DC',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  logItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  logUser: {
    fontSize: 14,
    color: '#A0522D',
  },
  logTime: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
  },
  logDetails: {
    fontSize: 14,
    color: '#654321',
    marginTop: 8,
    paddingLeft: 52,
    fontStyle: 'italic',
  },
});