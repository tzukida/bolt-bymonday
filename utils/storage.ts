// Storage Utility
// Provides a unified interface for local storage operations

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/config/app';

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      
      if (APP_CONFIG.development.enableDebugLogs) {
        console.log(`Storage: Set ${key}`, value);
      }
    } catch (error) {
      console.error(`Storage: Failed to set ${key}`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      const value = jsonValue ? JSON.parse(jsonValue) : null;
      
      if (APP_CONFIG.development.enableDebugLogs) {
        console.log(`Storage: Get ${key}`, value);
      }
      
      return value;
    } catch (error) {
      console.error(`Storage: Failed to get ${key}`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      
      if (APP_CONFIG.development.enableDebugLogs) {
        console.log(`Storage: Removed ${key}`);
      }
    } catch (error) {
      console.error(`Storage: Failed to remove ${key}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      
      if (APP_CONFIG.development.enableDebugLogs) {
        console.log('Storage: Cleared all data');
      }
    } catch (error) {
      console.error('Storage: Failed to clear', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage: Failed to get all keys', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Storage: Failed to get multiple items', error);
      return [];
    }
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      
      if (APP_CONFIG.development.enableDebugLogs) {
        console.log('Storage: Set multiple items', keyValuePairs);
      }
    } catch (error) {
      console.error('Storage: Failed to set multiple items', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
      
      if (APP_CONFIG.development.enableDebugLogs) {
        console.log('Storage: Removed multiple items', keys);
      }
    } catch (error) {
      console.error('Storage: Failed to remove multiple items', error);
      throw error;
    }
  }

  // Convenience methods for app-specific storage
  async setUser(user: any): Promise<void> {
    return this.setItem(APP_CONFIG.storage.user, user);
  }

  async getUser(): Promise<any> {
    return this.getItem(APP_CONFIG.storage.user);
  }

  async setProducts(products: any[]): Promise<void> {
    return this.setItem(APP_CONFIG.storage.products, products);
  }

  async getProducts(): Promise<any[]> {
    return this.getItem(APP_CONFIG.storage.products) || [];
  }

  async setTransactions(transactions: any[]): Promise<void> {
    return this.setItem(APP_CONFIG.storage.transactions, transactions);
  }

  async getTransactions(): Promise<any[]> {
    return this.getItem(APP_CONFIG.storage.transactions) || [];
  }

  async setUsers(users: any[]): Promise<void> {
    return this.setItem(APP_CONFIG.storage.users, users);
  }

  async getUsers(): Promise<any[]> {
    return this.getItem(APP_CONFIG.storage.users) || [];
  }

  async setNotifications(notifications: any[]): Promise<void> {
    return this.setItem(APP_CONFIG.storage.notifications, notifications);
  }

  async getNotifications(): Promise<any[]> {
    return this.getItem(APP_CONFIG.storage.notifications) || [];
  }

  async setActivityLogs(logs: any[]): Promise<void> {
    return this.setItem(APP_CONFIG.storage.activityLogs, logs);
  }

  async getActivityLogs(): Promise<any[]> {
    return this.getItem(APP_CONFIG.storage.activityLogs) || [];
  }
}

export const storage = StorageService.getInstance();
export default storage;