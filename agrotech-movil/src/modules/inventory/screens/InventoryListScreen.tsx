import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Plus, Package, Edit2, Trash2, DollarSign } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import InventoryFormScreen from './InventoryFormScreen';
import { inventoryAPI } from '../../../shared/services/api';
import { Insumo } from '../../../shared/types';

const InventoryListScreen: React.FC = () => {
  const [items, setItems] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Insumo | undefined>(undefined);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAll();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const handleNew = () => {
    setSelectedItem(undefined);
    setModalVisible(true);
  };

  const handleEdit = (item: Insumo) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar Ítem",
      "¿Estás seguro de eliminar este ítem?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await inventoryAPI.delete(id);
              fetchInventory();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el ítem');
            }
          }
        }
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    fetchInventory();
  };

  const renderItem = ({ item }: { item: Insumo }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Package size={24} color="#166534" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.description}>{item.descripcion || 'Sin descripción'}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>{item.cantidad} {item.unidad}</Text>
          <Text style={styles.separator}>•</Text>
          <DollarSign size={14} color="#666" />
          <Text style={styles.detailText}>${item.costoUnitario}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNew}>
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nuevo Ítem</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#166534" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchInventory}
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
            <InventoryFormScreen onClose={handleCloseModal} item={selectedItem} />
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    color: '#ccc',
    marginHorizontal: 4,
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

export default InventoryListScreen;
