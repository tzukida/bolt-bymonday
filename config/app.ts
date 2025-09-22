// app.ts or config/app.ts
import Constants from 'expo-constants';

// App Configuration
export const APP_CONFIG = {
  // App Information
  name: 'ByMonday',
  version: '1.0.0',
  description: 'Inventory & POS Management System',

  // API Configuration - Get from Expo Constants
  api: {
    baseUrl: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  },

  // Feature Flags - Get from Expo Constants
  features: {
    useBackend: Constants.expoConfig?.extra?.useBackend || false,
    enableNotifications: true,
    enableActivityLogs: true,
    enableUserManagement: true,
    enableReports: true,
    enableLowStockAlerts: true,
  },

  // Business Logic
  inventory: {
    lowStockThreshold: 10,
    criticalStockThreshold: 3,
    maxProductsPerCategory: 100,
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#8B4513',
      secondary: '#A0522D',
      accent: '#DEB887',
      background: '#F5F5DC',
      surface: '#FFFFFF',
      error: '#FF6347',
      warning: '#FFA500',
      success: '#228B22',
      info: '#4169E1',
    },
    animations: {
      duration: 300,
      easing: 'ease-in-out',
    },
  },

  // Storage Keys
  storage: {
    user: 'user',
    products: 'products',
    transactions: 'transactions',
    users: 'users',
    notifications: 'notifications',
    activityLogs: 'activityLogs',
    settings: 'settings',
  },

  // Notification Settings
  notifications: {
    maxNotifications: 50,
    lowStockCheckInterval: 60 * 60 * 1000, // 1 hour
    autoMarkReadAfter: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Security
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Development
  development: {
    enableDebugLogs: __DEV__,
    mockApiDelay: 1000,
    enableTestData: __DEV__,
  },
};

export default APP_CONFIG;