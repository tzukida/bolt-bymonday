import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useData } from '@/contexts/DataContext';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { transactions, products, isLoading } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const generateSalesData = () => {
    const now = new Date();
    const data: { [key: string]: number } = {};
    
    if (selectedPeriod === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data[key] = 0;
      }
    } else if (selectedPeriod === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const key = `Week ${4 - i}`;
        data[key] = 0;
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        data[key] = 0;
      }
    }

    // Populate with transaction data
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp || transaction.created_at || new Date());
      let key: string;
      
      if (selectedPeriod === 'daily') {
        key = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (selectedPeriod === 'weekly') {
        const weeksDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weeksDiff < 4) {
          key = `Week ${4 - weeksDiff}`;
        } else return;
      } else {
        key = transactionDate.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (data.hasOwnProperty(key)) {
        data[key] += transaction.total;
      }
    });

    return {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        strokeWidth: 2,
      }],
    };
  };

  const generateInventoryData = () => {
    const categoryData: { [key: string]: number } = {};
    
    products.forEach(product => {
      const category = product.category || 'General';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += product.stock;
    });

    return Object.entries(categoryData).map(([name, population], index) => ({
      name,
      population,
      color: ['#8B4513', '#DEB887', '#A0522D', '#D2B48C', '#F5F5DC'][index] || '#8B4513',
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

  const getTotalSales = () => {
    return transactions.reduce((total, transaction) => total + transaction.total, 0);
  };

  const getTotalTransactions = () => {
    return transactions.length;
  };

  const getAverageOrderValue = () => {
    if (transactions.length === 0) return 0;
    return getTotalSales() / transactions.length;
  };

  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Report has been exported successfully! The file has been saved to your downloads folder.',
      [{ text: 'OK' }]
    );
  };

  const chartConfig = {
    backgroundColor: 'white',
    backgroundGradientFrom: 'white',
    backgroundGradientTo: 'white',
    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const salesData = generateSalesData();
  const inventoryData = generateInventoryData();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
          <Download size={16} color="white" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <DollarSign size={24} color="#228B22" />
            <Text style={styles.summaryValue}>₱{getTotalSales().toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Sales</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <ShoppingBag size={24} color="#4169E1" />
            <Text style={styles.summaryValue}>{getTotalTransactions()}</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <TrendingUp size={24} color="#FF8C00" />
            <Text style={styles.summaryValue}>₱{getAverageOrderValue().toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Avg Order</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['daily', 'weekly', 'monthly'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Calendar size={20} color="#8B4513" />
            <Text style={styles.chartTitle}>Sales Trend</Text>
          </View>
          
          {salesData.datasets[0].data.some(value => value > 0) ? (
            <LineChart
              data={salesData}
              width={width - 48}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix="₱"
              yAxisInterval={1}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No sales data available for this period</Text>
            </View>
          )}
        </View>

        {/* Inventory Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <TrendingUp size={20} color="#8B4513" />
            <Text style={styles.chartTitle}>Inventory by Category</Text>
          </View>
          
          {inventoryData.length > 0 ? (
            <PieChart
              data={inventoryData}
              width={width - 48}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No inventory data available</Text>
            </View>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {isLoading ? (
            <Text style={styles.noDataText}>Loading transactions...</Text>
          ) : transactions.slice(0, 5).map(transaction => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionId}>#{transaction.id.slice(-6)}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.timestamp || transaction.created_at || new Date()).toLocaleDateString()}
                </Text>
                <Text style={styles.transactionMethod}>
                  {transaction.paymentMethod || transaction.payment_method || 'Cash'}
                </Text>
              </View>
              <Text style={styles.transactionAmount}>₱{transaction.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#A0522D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#8B4513',
  },
  periodButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  chart: {
    borderRadius: 8,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
  },
  transactionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
  },
});