import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseService } from '@/services/supabaseService';
import { APP_CONFIG } from '@/config/app';
import { useData } from '@/contexts/DataContext';

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
  const dataContext = useData();

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
        // Direct database lookup for login
        const result = await supabaseService.login(username, password);
        if (result.success && result.data) {
          foundUser = result.data;
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
        if (APP_CONFIG.features.useBackend && dataContext) {
          await supabaseService.createActivityLog({
            action: `User ${username} logged in`,
            user_id: foundUser.username,
            user_role: foundUser.role,
            type: 'login',
          });
        } else {
          if (dataContext) {
            await dataContext.addActivityLog({
              action: `User ${username} logged in`,
              userId: foundUser.username,
              userRole: foundUser.role,
              type: 'login',
            });
          }
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
      if (APP_CONFIG.features.useBackend && dataContext) {
        await supabaseService.createActivityLog({
          action: `User ${user.username} logged out`,
          user_id: user.username,
          user_role: user.role,
          type: 'logout',
        });
      } else {
        if (dataContext) {
          await dataContext.addActivityLog({
            action: `User ${user.username} logged out`,
            userId: user.username,
            userRole: user.role,
            type: 'logout',
          });
        }
      }
    }
    setUser(null);
    await AsyncStorage.removeItem('user');
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