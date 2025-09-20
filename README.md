# ByMonday - Inventory & POS Management App

A comprehensive mobile-first inventory and point-of-sale management system built with React Native and Expo.

## Features

### 🔐 Authentication & Role Management
- Role-based access control (Admin/Staff)
- Secure login with local user validation
- User management (Admin only)

### 📦 Inventory Management
- Product CRUD operations
- Color-coded stock level indicators
- Low stock alerts and notifications
- Bulk email to suppliers for restocking

### 🛒 Point of Sale (POS)
- Visual product grid with real-time stock tracking
- Shopping cart functionality
- Multiple payment method simulation
- Transaction processing with inventory updates

### 📊 Reports & Analytics
- Interactive sales trend charts
- Inventory analysis by category
- Daily/Weekly/Monthly reporting
- Export functionality (simulated)

### 🔔 Notifications
- In-app notification system
- Low stock alerts
- Transaction confirmations
- System notifications

### 📋 Activity Logs
- Comprehensive user activity tracking
- Transaction logs with details
- User management logs
- Inventory change tracking

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Storage**: AsyncStorage (local) with backend integration ready
- **Icons**: Lucide React Native
- **Charts**: React Native Chart Kit
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bymonday-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

### Sample Accounts

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Staff Account:**
- Username: `staff`
- Password: `staff123`

## Backend Integration

The app is designed to work both offline (local storage) and with a backend API. To enable backend integration:

1. Set `EXPO_PUBLIC_USE_BACKEND=true` in your `.env` file
2. Configure `EXPO_PUBLIC_API_URL` to point to your backend
3. Implement the API endpoints as defined in `services/api.ts`

### API Endpoints

The app expects the following REST API endpoints:

```
POST   /auth/login
POST   /auth/logout
GET    /users
POST   /users
PUT    /users/:id
DELETE /users/:id
GET    /products
POST   /products
PUT    /products/:id
DELETE /products/:id
GET    /transactions
POST   /transactions
GET    /activity-logs
POST   /activity-logs
GET    /notifications
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
GET    /reports/sales
GET    /reports/inventory
GET    /products/low-stock
POST   /suppliers/email
```

## Project Structure

```
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry point
│   └── login.tsx          # Login screen
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── DataContext.tsx    # App data state
├── services/              # API and external services
│   └── api.ts             # API service layer
├── hooks/                 # Custom React hooks
│   ├── useApi.ts          # API integration hook
│   └── useFrameworkReady.ts
├── utils/                 # Utility functions
│   └── storage.ts         # Storage service
├── config/                # App configuration
│   └── app.ts             # App settings
└── assets/                # Static assets
```

## Configuration

The app uses a centralized configuration system in `config/app.ts`. Key settings include:

- **Theme colors**: Coffee shop palette
- **Business logic**: Stock thresholds, limits
- **Feature flags**: Enable/disable features
- **API settings**: Endpoints, timeouts
- **Storage keys**: Local storage organization

## Features by Role

### Admin Users
- Full dashboard with all metrics
- Inventory management (CRUD operations)
- User management
- Reports and analytics
- Activity logs
- All POS features
- Notifications

### Staff Users
- Limited dashboard with sales metrics
- POS functionality
- Low stock alerts
- Notifications

## Development

### Adding New Features

1. **New Screen**: Add to `app/(tabs)/` directory
2. **New API Endpoint**: Update `services/api.ts`
3. **New Data Type**: Update `contexts/DataContext.tsx`
4. **New Configuration**: Update `config/app.ts`

### Testing

The app includes sample data for testing:
- Pre-populated products with various stock levels
- Sample users with different roles
- Mock transactions for reporting

### Debugging

Enable debug logs by setting `EXPO_PUBLIC_DEBUG_LOGS=true` in your `.env` file.

## Deployment

### Mobile App Stores

1. Build for production:
```bash
expo build:android
expo build:ios
```

2. Follow Expo's deployment guides for app stores

### Web Version

```bash
npm run build:web
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
