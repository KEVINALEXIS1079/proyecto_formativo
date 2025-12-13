import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert, TextInput, ScrollView, Platform } from 'react-native';
import { Plus, MapPin, Layers, Trash2, Search, BarChart3, Map, List } from 'lucide-react-native';
import MapComponent from '../components/MapComponent';
import { useFocusEffect } from '@react-navigation/native';
import GeoFormScreen from './GeoFormScreen';
import { geoAPI } from '../../../shared/services/api';
import { Lote, SubLote } from '../../../shared/types';

const GeoListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lotes' | 'sublotes'>('lotes');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [sublotes, setSublotes] = useState<SubLote[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | undefined>(undefined);
  const [selectedSublote, setSelectedSublote] = useState<SubLote | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const fetchLotes = async () => {
    setLoading(true);
    try {
      const response = await geoAPI.getLotes();
      const rawData = response.data;
      const data = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);
      setLotes(data);
    } catch (error) {
      console.error('Error fetching lotes:', error);
      Alert.alert('Error', 'No se pudieron cargar los lotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSublotes = async () => {
    setLoading(true);
    try {
      const response = await geoAPI.getSubLotes();
      const rawData = response.data;
      const data = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);
      setSublotes(data);
    } catch (error) {
      console.error('Error fetching sublotes:', error);
      Alert.alert('Error', 'No se pudieron cargar los sublotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchLotes(), fetchSublotes()]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const metrics = useMemo(() => {
    if (activeTab === 'lotes') {
      const count = lotes.length;
      const totalArea = lotes.reduce((acc, lote) => acc + lote.area, 0);
      return { count, totalArea, label: 'Lotes' };
    } else {
      const count = sublotes.length;
      const totalArea = sublotes.reduce((acc, sublote) => acc + sublote.area, 0);
      return { count, totalArea, label: 'Sublotes' };
    }
  }, [activeTab, lotes, sublotes]);

  const filteredData = useMemo(() => {
    const data = activeTab === 'lotes' ? lotes : sublotes;
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item => item.nombre.toLowerCase().includes(query));
  }, [activeTab, lotes, sublotes, searchQuery]);

  const handleNew = () => {
    if (activeTab === 'lotes') {
      setSelectedLote(undefined);
      setSelectedSublote(undefined);
    } else {
      setSelectedSublote(undefined);
      setSelectedLote(undefined);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    fetchData();
  };

  const handleDelete = (id: number) => {
    const isLote = activeTab === 'lotes';
    Alert.alert(
      `Eliminar ${isLote ? 'Lote' : 'Sublote'}`,
      `¿Estás seguro de eliminar este ${isLote ? 'lote' : 'sublote'}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              if (isLote) {
                await geoAPI.deleteLote(id);
              } else {
                await geoAPI.deleteSubLote(id);
              }
              fetchData();
            } catch (error) {
              Alert.alert('Error', `No se pudo eliminar el ${isLote ? 'lote' : 'sublote'}`);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item: Lote | SubLote) => {
    if (activeTab === 'lotes') {
      setSelectedLote(item as Lote);
      setSelectedSublote(undefined);
    } else {
      setSelectedSublote(item as SubLote);
      setSelectedLote(undefined);
    }
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Lote | SubLote }) => {
    const isLote = activeTab === 'lotes';
    const loteItem = item as Lote;
    const subloteItem = item as SubLote;

    return (
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MapPin size={24} color="#166534" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.nombre}</Text>
          <Text style={styles.description}>
            {isLote ? (loteItem.descripcion || 'Sin descripción') : `Lote ID: ${subloteItem.loteId}`}
          </Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>{item.area} Ha</Text>
            {isLote && (
              <>
                <Text style={styles.separator}>•</Text>
                <Layers size={14} color="#666" />
                <Text style={styles.detailText}>{loteItem.sublotes?.length || 0} Sublotes</Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Georreferenciación</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNew}>
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>
            Nuevo {activeTab === 'lotes' ? 'Lote' : 'Sublote'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lotes' && styles.activeTab]}
          onPress={() => setActiveTab('lotes')}
        >
          <Text style={[styles.tabText, activeTab === 'lotes' && styles.activeTabText]}>
            Lotes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sublotes' && styles.activeTab]}
          onPress={() => setActiveTab('sublotes')}
        >
          <Text style={[styles.tabText, activeTab === 'sublotes' && styles.activeTabText]}>
            Sublotes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <BarChart3 size={20} color="#166534" />
          <Text style={styles.metricValue}>{metrics.count}</Text>
          <Text style={styles.metricLabel}>{metrics.label}</Text>
        </View>
        <View style={styles.metric}>
          <MapPin size={20} color="#166534" />
          <Text style={styles.metricValue}>{metrics.totalArea.toFixed(2)}</Text>
          <Text style={styles.metricLabel}>Hectáreas</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar ${activeTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
          onPress={() => setViewMode('list')}
        >
          <List size={20} color={viewMode === 'list' ? '#fff' : '#666'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'map' && styles.activeViewButton]}
          onPress={() => setViewMode('map')}
        >
          <Map size={20} color={viewMode === 'map' ? '#fff' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#166534" style={{ marginTop: 20 }} />
      ) : viewMode === 'list' ? (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchData}
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapComponent data={filteredData} />
        </View>
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
            <GeoFormScreen
              onClose={handleCloseModal}
              activeTab={activeTab}
              selectedLote={selectedLote}
              selectedSublote={selectedSublote}
            />
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#166534',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minWidth: 100,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: '#166534',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
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

export default GeoListScreen;
