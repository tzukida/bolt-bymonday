import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, User, Clock, ShoppingCart, Package, UserPlus, Settings } from 'lucide-react-native';

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userRole: string;
  timestamp: string;
  details?: any;
}

export default function LogsScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const logsData = await AsyncStorage.getItem('activityLogs');
      if (logsData) {
        setLogs(JSON.parse(logsData));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setIsRefreshing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#4169E1' : '#228B22';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('logged in') || action.includes('logged out')) {
      return User;
    } else if (action.includes('transaction') || action.includes('Processed transaction')) {
      return ShoppingCart;
    } else if (action.includes('product') || action.includes('stock')) {
      return Package;
    } else if (action.includes('user') || action.includes('User')) {
      return UserPlus;
    } else if (action.includes('Email') || action.includes('supplier')) {
      return Settings;
    }
    return Activity;
  };

  const getRoleColor = (userRole: string) => {
    return userRole === 'admin' ? '#4169E1' : '#228B22';
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Logs</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{logs.length} entries</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={48} color="#DEB887" />
            <Text style={styles.emptyTitle}>No Activity Logs</Text>
            <Text style={styles.emptySubtitle}>
              User activities will appear here as they occur
            </Text>
          </View>
        ) : (
          <View style={styles.logsList}>
            {logs.map(log => {
              const { date, time } = formatTimestamp(log.timestamp);
              const ActionIcon = getActionIcon(log.action);
              
              return (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <View style={styles.logIcon}>
                      <ActionIcon size={20} color="#8B4513" />
                    </View>
                    
                    <View style={styles.logContent}>
                      <Text style={styles.logAction}>{log.action}</Text>
                      <View style={styles.logMeta}>
                        <View style={styles.roleTag}>
                          <Text style={[styles.roleText, { color: getRoleColor(log.userRole) }]}>
                            {log.userRole.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.timestampContainer}>
                          <Clock size={12} color="#666" />
                          <Text style={styles.timestamp}>{time}</Text>
                          <Text style={styles.date}>{date}</Text>
                        </View>
                      </View>
                      {log.details && (
                        <Text style={styles.logDetails}>
                          {typeof log.details === 'object' 
                            ? JSON.stringify(log.details, null, 2).slice(0, 100) + '...'
                            : log.details
                          }
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerStats: {
    backgroundColor: '#A0522D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  logsList: {
    gap: 12,
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5DC',
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
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleTag: {
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DEB887',
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  logDetails: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});