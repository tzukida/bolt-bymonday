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
  TextInput,
} from 'react-native';
import { useData } from '@/contexts/DataContext';
import { Plus, CreditCard as Edit, Trash2, Package, TriangleAlert as AlertTriangle, Mail } from 'lucide-react-native';
import type { Product } from '@/contexts/DataContext';

export default function InventoryScreen() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    category: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      image: '',
      category: '',
    });
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: formData.category || 'General',
      });

      Alert.alert('Success', 'Product added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image,
      category: product.category,
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateProduct({
        ...editingProduct,
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image,
        category: formData.category,
      });

      Alert.alert('Success', 'Product updated successfully');
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  const handleEmailSupplier = (product: Product) => {
    Alert.alert(
      'Email Supplier',
      `Email has been sent to supplier requesting restock of ${product.name}`,
      [{ text: 'OK' }]
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 3) return { color: '#FF6347', text: 'Critical', icon: AlertTriangle };
    if (stock <= 10) return { color: '#FFA500', text: 'Low', icon: AlertTriangle };
    return { color: '#228B22', text: 'OK', icon: Package };
  };

  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <Modal visible={isEdit ? showEditModal : showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.formModal}>
          <Text style={styles.modalTitle}>{isEdit ? 'Edit Product' : 'Add New Product'}</Text>
          
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price (₱) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({ ...formData, stock: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Coffee, Pastry, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
                placeholder="https://example.com/image.jpg"
                multiline
              />
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                isEdit ? setShowEditModal(false) : setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={isEdit ? handleUpdateProduct : handleAddProduct}
            >
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update' : 'Add'} Product
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Package size={24} color="#8B4513" />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#FF6347" />
            <Text style={styles.statNumber}>
              {products.filter(p => p.stock <= 10).length}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Products</Text>
        
        {products.map(product => {
          const stockStatus = getStockStatus(product.stock);
          const StatusIcon = stockStatus.icon;
          
          return (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                
                <View style={styles.stockInfo}>
                  <StatusIcon size={16} color={stockStatus.color} />
                  <Text style={[styles.stockText, { color: stockStatus.color }]}>
                    {product.stock} - {stockStatus.text}
                  </Text>
                </View>
              </View>

              <View style={styles.productActions}>
                {product.stock <= 10 && (
                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={() => handleEmailSupplier(product)}
                  >
                    <Mail size={16} color="#8B4513" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditProduct(product)}
                >
                  <Edit size={16} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteProduct(product)}
                >
                  <Trash2 size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <ProductForm isEdit={false} />
      <ProductForm isEdit={true} />
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
  addButton: {
    backgroundColor: '#A0522D',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emailButton: {
    backgroundColor: '#F5F5DC',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  editButton: {
    backgroundColor: '#4169E1',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  formFields: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEB887',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
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
  submitButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});