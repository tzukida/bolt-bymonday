export const APP_CONFIG = {
  name: 'ByMonday',
  version: '1.0.0',
  features: {
    useBackend: process.env.EXPO_PUBLIC_USE_BACKEND === 'true',
    enableNotifications: true,
    enableActivityLogs: true,
    enableUserManagement: true,
    enableReports: true,
    enableLowStockAlerts: true,
  },
};
