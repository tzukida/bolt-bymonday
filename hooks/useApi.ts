// Custom hook for API integration
// This hook provides a way to easily switch between local storage and API calls

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api';

interface UseApiOptions {
  useBackend?: boolean;
  cacheKey?: string;
  initialData?: any;
}

export function useApi<T>(
  apiCall: () => Promise<any>,
  options: UseApiOptions = {}
) {
  const { useBackend = false, cacheKey, initialData = null } = options;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useBackend) {
        // Use API
        const response = await apiCall();
        if (response.success) {
          setData(response.data);
          // Cache the data locally as backup
          if (cacheKey) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
          }
        } else {
          throw new Error(response.error || 'API call failed');
        }
      } else {
        // Use local storage
        if (cacheKey) {
          const cachedData = await AsyncStorage.getItem(cacheKey);
          if (cachedData) {
            setData(JSON.parse(cachedData));
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Fallback to cached data if API fails
      if (useBackend && cacheKey) {
        try {
          const cachedData = await AsyncStorage.getItem(cacheKey);
          if (cachedData) {
            setData(JSON.parse(cachedData));
            console.warn('Using cached data due to API error:', errorMessage);
          }
        } catch (cacheError) {
          console.error('Failed to load cached data:', cacheError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch };
}

// Specific hooks for different data types
export function useProducts(useBackend = false) {
  return useApi(
    () => apiService.getProducts(),
    { useBackend, cacheKey: 'products' }
  );
}

export function useTransactions(useBackend = false) {
  return useApi(
    () => apiService.getTransactions(),
    { useBackend, cacheKey: 'transactions' }
  );
}

export function useUsers(useBackend = false) {
  return useApi(
    () => apiService.getUsers(),
    { useBackend, cacheKey: 'users' }
  );
}

export function useNotifications(useBackend = false) {
  return useApi(
    () => apiService.getNotifications(),
    { useBackend, cacheKey: 'notifications' }
  );
}

export function useActivityLogs(useBackend = false) {
  return useApi(
    () => apiService.getActivityLogs(),
    { useBackend, cacheKey: 'activityLogs' }
  );
}