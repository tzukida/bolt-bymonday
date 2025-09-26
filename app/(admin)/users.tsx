import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useData } from '@/contexts/DataContext';
import { Plus, CreditCard as Edit, Trash2, User, Shield, Mail, Calendar } from 'lucide-react-native';
import type { User as UserType } from '@/contexts/DataContext';

export default function UsersScreen() {
  const { users, addUser, updateUser, deleteUser } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' as 'admin' | 'staff',
    email: '',
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'staff',
      email: '',
    });
  };

  const handleAddUser = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in username and password');
      return;
    }

    // Check if username already exists
    if (users.some(u => u.username === formData.username)) {
      Alert.alert('Error', 'Username already exists');
      return;
    }

    try {
      await addUser({
        username: formData.username,
        password: formData.password,
        role: formData.role,
        email: formData.email,
      });

      Alert.alert('Success', 'User added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
      email: user.email || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in username and password');
      return;
    }

    // Check if username already exists (excluding current user)
    if (users.some(u => u.username === formData.username && u.id !== editingUser.id)) {
      Alert.alert('Error', 'Username already exists');
      return;
    }

    try {
      await updateUser({
        ...editingUser,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        email: formData.email,
      });

      Alert.alert('Success', 'User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleDeleteUser = (user: UserType) => {
    if (users.length <= 1) {
      Alert.alert('Error', 'Cannot delete the last user');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUser(user.id),
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#4169E1' : '#228B22';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const UserForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <Modal visible={isEdit ? showEditModal : showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.formModal}>
          <Text style={styles.modalTitle}>{isEdit ? 'Edit User' : 'Add New User'}</Text>
          
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="Enter username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Enter password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'staff' && styles.roleButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'staff' })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'staff' && styles.roleButtonTextActive
                  ]}>
                    Staff
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'admin' && styles.roleButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'admin' })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'admin' && styles.roleButtonTextActive
                  ]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
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
              onPress={isEdit ? handleUpdateUser : handleAddUser}
            >
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update' : 'Add'} User
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
        <Text style={styles.headerTitle}>User Management</Text>
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
            <User size={24} color="#8B4513" />
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Shield size={24} color="#4169E1" />
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Users</Text>
        
        {users.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userIcon}>
              <User size={24} color="#8B4513" />
            </View>
            
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{user.username}</Text>
                <View style={[styles.roleTag, { backgroundColor: `${getRoleColor(user.role)}20` }]}>
                  <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {user.email && (
                <View style={styles.userDetail}>
                  <Mail size={14} color="#666" />
                  <Text style={styles.userDetailText}>{user.email}</Text>
                </View>
              )}
              
              <View style={styles.userDetail}>
                <Calendar size={14} color="#666" />
                <Text style={styles.userDetailText}>
                  Created: {formatDate(user.created_at)}
                </Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditUser(user)}
              >
                <Edit size={16} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(user)}
              >
                <Trash2 size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <UserForm isEdit={false} />
      <UserForm isEdit={true} />
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
  userCard: {
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
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userDetailText: {
    fontSize: 12,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
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
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5DC',
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: '#8B4513',
  },
  roleButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: 'white',
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