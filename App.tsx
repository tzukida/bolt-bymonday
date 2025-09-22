import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { APP_CONFIG } from './config/appConfig';
import { supabaseService } from './services/supabase';

export default function App() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (APP_CONFIG.features.useBackend) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await supabaseService.getUsers();
    if (res.success) {
      setUsers(res.data);
    } else {
      console.log('Error fetching users:', res.error);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{APP_CONFIG.name}</Text>
      <Text style={styles.subtitle}>Users from Supabase:</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : users.length > 0 ? (
        users.map((u) => (
          <View key={u.id} style={styles.userCard}>
            <Text style={styles.userName}>{u.name}</Text>
            <Text style={styles.userEmail}>{u.email}</Text>
          </View>
        ))
      ) : (
        <Text>No users found.</Text>
      )}

      <Button title="Refresh Users" onPress={fetchUsers} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: APP_CONFIG.ui?.theme?.background || '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_CONFIG.ui?.theme?.primary || '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  userCard: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    backgroundColor: APP_CONFIG.ui?.theme?.surface || '#f5f5f5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
  },
});
