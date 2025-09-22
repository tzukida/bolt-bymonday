// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseService } from '@/services/supabaseService';
import { APP_CONFIG } from '@/config/app';

export interface User {
  username: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 AuthProvider mounted');
    console.log('🔧 useBackend flag:', APP_CONFIG.features.useBackend);
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('📦 Loaded user from storage:', userData);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Login attempt started');
      console.log('🔧 useBackend flag:', APP_CONFIG.features.useBackend);
      console.log('👤 Username:', username);
      
      let foundUser = null;

      if (APP_CONFIG.features.useBackend) {
        console.log('🚀 Using Supabase backend login');
        const result = await supabaseService.login(username, password);
        console.log('📋 Supabase login result:', result);
        
        if (result.success) {
          foundUser = result.data;
          console.log('✅ Supabase login successful');
        } else {
          console.error('❌ Supabase login failed:', result.error);
        }
      } else {
        console.log('💾 Using local storage login');
        // Get users from storage
        const usersData = await AsyncStorage.getItem('users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        console.log('📋 Local users count:', users.length);
        foundUser = users.find(
          (u: any) => u.username === username && u.password === password
        );
        
        if (foundUser) {
          console.log('✅ Local login successful');
        } else {
          console.log('❌ Local login failed - user not found');
        }
      }

      console.log('👤 Found user:', foundUser);
      
      if (foundUser) {
        const userData = { 
          username: foundUser.username, 
          role: foundUser.role 
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Log the login activity
        await logActivity(`User ${username} logged in`, foundUser.role);
        
        console.log('🎉 Login completed successfully');
        return true;
      }
      
      console.log('❌ Login failed - no user found');
      return false;
    } catch (error) {
      console.error('💥 Error during login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user:', user?.username);
      if (user) {
        await logActivity(`User ${user.username} logged out`, user.role);
      }
      setUser(null);
      await AsyncStorage.removeItem('user');
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  const logActivity = async (action: string, role: string) => {
    try {
      const existingLogs = await AsyncStorage.getItem('activityLogs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      const newLog = {
        id: Date.now().toString(),
        action,
        userId: user?.username || 'unknown',
        userRole: role,
        timestamp: new Date().toISOString(),
      };
      
      logs.unshift(newLog);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(100);
      }
      
      await AsyncStorage.setItem('activityLogs', JSON.stringify(logs));
      console.log('📝 Activity logged:', action);
    } catch (error) {
      console.error('❌ Error logging activity:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}