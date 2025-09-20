// API Service for Backend Integration
// This file provides a centralized way to handle API calls
// Replace BASE_URL with your actual backend URL

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication
  async login(username: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async createUser(userData: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return this.request<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async createProduct(productData: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request<any>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  async getTransactions() {
    return this.request<any[]>('/transactions');
  }

  async createTransaction(transactionData: any) {
    return this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Activity Logs
  async getActivityLogs() {
    return this.request<any[]>('/activity-logs');
  }

  async createActivityLog(logData: any) {
    return this.request<any>('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Reports
  async getSalesReport(period: 'daily' | 'weekly' | 'monthly') {
    return this.request<any>(`/reports/sales?period=${period}`);
  }

  async getInventoryReport() {
    return this.request<any>('/reports/inventory');
  }

  // Low Stock
  async getLowStockProducts() {
    return this.request<any[]>('/products/low-stock');
  }

  async emailSuppliers(productIds: string[]) {
    return this.request('/suppliers/email', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;