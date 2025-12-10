import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Plus, Sprout, Edit2, Trash2, Calendar } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import CropFormScreen from './CropFormScreen';
import { cropsAPI } from '../../../shared/services/api';
import { Cultivo } from '../../../shared/types';

const CropsListScreen: React.FC = () => {
  const [crops, setCrops] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Cultivo | undefined>(undefined);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const response = await cropsAPI.getAll();
      setCrops(response.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
      Alert.alert('Error', 'No se pudieron cargar los cultivos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCrops();
    }, [])
  );

  const handleNew = () => {
    setSelectedCrop(undefined);
    setModalVisible(true);
  };

  const handleEdit = (crop: Cultivo) => {
    setSelectedCrop(crop);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar Cultivo",
      "¿Estás seguro de eliminar este cultivo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await cropsAPI.delete(id);
              fetchCrops();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el cultivo');
            }
          }
        }
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    fetchCrops();
  };

  const renderItem = ({ item }: { item: Cultivo }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Sprout size={24} color="#166534" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.description}>{item.variedad}</Text>
        <View style={styles.details}>
          <Calendar size={14} color="#666" />
          <Text style={styles.detailText}>{new Date(item.fechaSiembra).toLocaleDateString()}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.detailText}>{item.area} Ha</Text>
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
        <Text style={styles.title}>Cultivos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNew}>
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nuevo Cultivo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#166534" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={crops}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchCrops}
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
            <CropFormScreen onClose={handleCloseModal} crop={selectedCrop} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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

export default CropsListScreen;
