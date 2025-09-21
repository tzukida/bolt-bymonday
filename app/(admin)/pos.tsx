import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Plus, Minus, CreditCard, Smartphone, DollarSign } from 'lucide-react-native';
import type { Product, CartItem } from '@/contexts/DataContext';

export default function POSScreen() {
  const { products, addTransaction } = useData();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        Alert.alert('Stock Limit', 'Cannot add more items than available stock.');
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.product.id !== productId));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handlePayment = async (paymentMethod: string) => {
    if (cart.length === 0) return;

    try {
      await addTransaction({
        items: cart,
        total: getTotalAmount(),
        paymentMethod,
        userId: user?.username || 'unknown',
      });

      Alert.alert('Success', 'Transaction completed successfully!');
      setCart([]);
      setShowPaymentModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process transaction');
    }
  };

  const getStockColor = (stock: number) => {
    if (stock <= 3) return '#FF6347';
    if (stock <= 10) return '#FFA500';
    return '#228B22';
  };

  const PaymentModal = () => (
    <Modal visible={showPaymentModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.paymentModal}>
          <Text style={styles.modalTitle}>Select Payment Method</Text>
          <Text style={styles.totalAmount}>Total: ₱{getTotalAmount().toFixed(2)}</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={() => handlePayment('Cash')}
            >
              <DollarSign size={24} color="white" />
              <Text style={styles.paymentButtonText}>Cash</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: '#1E90FF' }]}
              onPress={() => handlePayment('GCash')}
            >
              <Smartphone size={24} color="white" />
              <Text style={styles.paymentButtonText}>GCash</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: '#FF1493' }]}
              onPress={() => handlePayment('Maya')}
            >
              <CreditCard size={24} color="white" />
              <Text style={styles.paymentButtonText}>Maya</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: '#4169E1' }]}
              onPress={() => handlePayment('PayPal')}
            >
              <CreditCard size={24} color="white" />
              <Text style={styles.paymentButtonText}>PayPal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: '#FF8C00' }]}
              onPress={() => handlePayment('Cryptocurrency')}
            >
              <CreditCard size={24} color="white" />
              <Text style={styles.paymentButtonText}>Crypto</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowPaymentModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Point of Sale</Text>
        <View style={styles.cartInfo}>
          <ShoppingCart size={20} color="white" />
          <Text style={styles.cartCount}>{cart.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>Products</Text>
        <View style={styles.productsGrid}>
          {products.map(product => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockText, { color: getStockColor(product.stock) }]}>
                    Stock: {product.stock}
                  </Text>
                </View>
              </View>
              
              <View style={styles.productActions}>
                {cart.find(item => item.product.id === product.id) ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => removeFromCart(product.id)}
                    >
                      <Minus size={16} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>
                      {cart.find(item => item.product.id === product.id)?.quantity || 0}
                    </Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => addToCart(product)}
                    >
                      <Plus size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addButton, product.stock <= 0 && styles.disabledButton]}
                    onPress={() => addToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Cart ({cart.length} items)</Text>
            <Text style={styles.cartTotal}>₱{getTotalAmount().toFixed(2)}</Text>
          </View>
          
          <ScrollView horizontal style={styles.cartItems} showsHorizontalScrollIndicator={false}>
            {cart.map(item => (
              <View key={item.product.id} style={styles.cartItem}>
                <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
                <Text style={styles.cartItemName}>{item.product.name}</Text>
                <Text style={styles.cartItemQuantity}>×{item.quantity}</Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      <PaymentModal />
    </View>
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
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A0522D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  cartCount: {
    color: 'white',
    fontWeight: 'bold',
  },
  productsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  productsGrid: {
    gap: 12,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productActions: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    backgroundColor: '#8B4513',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#8B4513',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cartSummary: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#DEB887',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  cartItems: {
    marginBottom: 16,
  },
  cartItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 4,
  },
  cartItemName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    marginBottom: 2,
  },
  cartItemQuantity: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  checkoutButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentMethods: {
    gap: 12,
    marginBottom: 24,
  },
  paymentButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#DEB887',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
  },
});