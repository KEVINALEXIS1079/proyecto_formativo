import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator, Alert } from 'react-native';
import { Plus, Edit2, Trash2, Users, Shield, Lock } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import UserFormScreen from './UserFormScreen';
import RolesListScreen from './RolesListScreen';
import PermissionsListScreen from './PermissionsListScreen';
import { usersAPI } from '../../../shared/services/api';
import { User } from '../../../shared/types';

const UsersListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'users') {
        fetchUsers();
      }
    }, [activeTab])
  );

  const handleNew = () => {
    setSelectedUser(undefined);
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar Usuario",
      "¿Estás seguro de eliminar este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await usersAPI.delete(id);
              fetchUsers();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    fetchUsers();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.nombre}+${item.apellido}&background=random` }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{item.rol?.nombre || 'Sin Rol'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
          <Edit2 size={18} color="#15803d" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'users' && styles.activeTab]} 
        onPress={() => setActiveTab('users')}
      >
        <Users size={20} color={activeTab === 'users' ? '#166534' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Usuarios</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'roles' && styles.activeTab]} 
        onPress={() => setActiveTab('roles')}
      >
        <Shield size={20} color={activeTab === 'roles' ? '#166534' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'roles' && styles.activeTabText]}>Roles</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'permissions' && styles.activeTab]} 
        onPress={() => setActiveTab('permissions')}
      >
        <Lock size={20} color={activeTab === 'permissions' ? '#166534' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'permissions' && styles.activeTabText]}>Permisos</Text>
      </TouchableOpacity>
    </View>
  );

  if (activeTab === 'roles') {
    return (
      <View style={styles.container}>
        {renderTabs()}
        <RolesListScreen />
      </View>
    );
  }

  if (activeTab === 'permissions') {
    return (
      <View style={styles.container}>
        {renderTabs()}
        <PermissionsListScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNew}>
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nuevo Usuario</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#166534" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchUsers}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <UserFormScreen onClose={handleCloseModal} user={selectedUser} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 2,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#dcfce7',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#166534',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  editButton: {
    backgroundColor: '#dcfce7',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'transparent',
  },
});

export default UsersListScreen;
