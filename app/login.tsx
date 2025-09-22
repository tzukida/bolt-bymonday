import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        // Navigation will be handled by the index screen based on user role
        router.replace('/');
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=200' }}
            style={styles.logo}
          />
          <Text style={styles.title}>ByMonday</Text>
          <Text style={styles.subtitle}>Inventory & POS Management</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.credentialsContainer}>
            <Text style={styles.credentialsTitle}>Sample Accounts:</Text>
            <Text style={styles.credentialsText}>Admin: admin / admin123</Text>
            <Text style={styles.credentialsText}>Staff: staff / staff123</Text>
          </View>

{/* TEMPORARY: Go to Setup Admin */}
<TouchableOpacity
  style={[styles.loginButton, { marginTop: 16, backgroundColor: '#556B2F' }]}
  onPress={() => router.push('/setup-admin')}
>
  <Text style={styles.loginButtonText}>Go to Setup Admin</Text>
</TouchableOpacity>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEB887',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  loginButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0522D',
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  credentialsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5DC',
    borderRadius: 12,
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 13,
    color: '#A0522D',
    marginBottom: 4,
  },
});