import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseService } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/app';

export interface User {
  username: string;
  role: 'admin' | 'staff';
  id?: string;
  email?: string;
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
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      let foundUser = null;

      if (APP_CONFIG.features.useBackend) {
        // First try to authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: `${username}@bymonday.com`, // Convert username to email format
          password: password,
        });

        if (authError) {
          // Fallback to direct database lookup for existing users
          const result = await supabaseService.login(username, password);
          if (result.success && result.data) {
            foundUser = result.data;
          }
        } else if (authData.user) {
          // Get user details from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
          
          if (!userError && userData) {
            foundUser = userData;
          }
        }
      } else {
        // Get users from storage
        const usersData = await AsyncStorage.getItem('users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        foundUser = users.find(
          (u: any) => u.username === username && u.password === password
        );
      }

      if (foundUser) {
        const userData = { 
          username: foundUser.username, 
          role: foundUser.role,
          id: foundUser.id,
          email: foundUser.email 
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Log the login activity
        if (APP_CONFIG.features.useBackend) {
          await supabaseService.createActivityLog({
            action: `User ${username} logged in`,
            user_id: foundUser.username,
            user_role: foundUser.role,
            type: 'login',
          });
        } else {
          await logActivity(`User ${username} logged in`, foundUser.role);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = async () => {
    if (user) {
      if (APP_CONFIG.features.useBackend) {
        await supabaseService.createActivityLog({
          action: `User ${user.username} logged out`,
          user_id: user.username,
          user_role: user.role,
          type: 'logout',
        });
        // Sign out from Supabase Auth
        await supabase.auth.signOut();
      } else {
        await logActivity(`User ${user.username} logged out`, user.role);
      }
    }
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const logActivity = async (action: string, role: string) => {
    try {
      const existingLogs = await AsyncStorage.getItem('activityLogs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      const newLog = {
        id: Date.now().toString(),
        action,
        user_id: user?.username || 'unknown',
        userRole: role,
        type: 'system',
        timestamp: new Date().toISOString(),
      };
      
      logs.unshift(newLog);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(100);
      }
      
      await AsyncStorage.setItem('activityLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging activity:', error);
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