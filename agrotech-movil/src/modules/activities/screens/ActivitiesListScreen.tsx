import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ActivityIndicator, Alert, TextInput, ScrollView
} from 'react-native';
import { Plus, Search, Filter } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import ActivityFormScreen from './ActivityFormScreen';
import ActivityCard from '../components/ActivityCard';
import { activitiesAPI, geoAPI, cropsAPI } from '../../../shared/services/api';
import { Activity, TipoActividad, SubtipoActividad } from '../types';
import { useActivities } from '../hooks/useActivities';

type RootStackParamList = {
  ActivityDetail: { activityId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ActivitiesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { activities, loading, filteredActivities, filters, setFilters, refresh } = useActivities();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'pendiente' | 'finalizada'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [tipoFilter, setTipoFilter] = useState<TipoActividad | ''>('');
  const [subtipoFilter, setSubtipoFilter] = useState<SubtipoActividad | ''>('');
  const [loteFilter, setLoteFilter] = useState<number | undefined>(undefined);
  const [cultivoFilter, setCultivoFilter] = useState<number | undefined>(undefined);
  const [fechaInicioFilter, setFechaInicioFilter] = useState('');
  const [fechaFinFilter, setFechaFinFilter] = useState('');

  // Data for filters
  const [lotes, setLotes] = useState<any[]>([]);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  const [cultivos, setCultivos] = useState<any[]>([]);

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [lotesRes, subLotesRes, cultivosRes] = await Promise.all([
          geoAPI.getLotes(),
          geoAPI.getSubLotes(),
          cropsAPI.getAll()
        ]);
        setLotes(lotesRes.data || []);
        setSubLotes(subLotesRes.data || []);
        setCultivos(cultivosRes.data || []);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };
    loadFilterData();
  }, []);

  // Update filters when local states change
  useEffect(() => {
    const estado = activeTab === 'all' ? undefined : activeTab === 'pendiente' ? 'Pendiente' : 'Finalizada';
    setFilters({
      estado,
      search: searchQuery || undefined,
      tipo: tipoFilter || undefined,
      subtipo: subtipoFilter || undefined,
      fechaInicio: fechaInicioFilter || undefined,
      fechaFin: fechaFinFilter || undefined,
    });
  }, [activeTab, searchQuery, tipoFilter, subtipoFilter, loteFilter, cultivoFilter, fechaInicioFilter, fechaFinFilter, setFilters]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleTabChange = (tab: 'all' | 'pendiente' | 'finalizada') => {
    setActiveTab(tab);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleNew = () => {
    setSelectedActivity(undefined);
    setModalVisible(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar Actividad",
      "¿Estás seguro de eliminar esta actividad?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await activitiesAPI.delete(id);
              refresh();
              Alert.alert('Éxito', 'Actividad eliminada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la actividad');
            }
          }
        }
      ]
    );
  };

  const handleCardPress = (activity: Activity) => {
    navigation.navigate('ActivityDetail', { activityId: activity.id });
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    refresh();
  };

  // Metrics
  const metrics = {
    total: filteredActivities.length,
    horas: filteredActivities.reduce((acc, x) => acc + Number(x.horasActividad || 0), 0),
    costo: filteredActivities.reduce((acc, x) => acc + Number(x.costoManoObra || 0), 0),
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Actividades</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNew}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.horas}</Text>
          <Text style={styles.metricLabel}>Horas</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>${metrics.costo.toLocaleString('es-CO')}</Text>
          <Text style={styles.metricLabel}>Costo</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar actividades..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Advanced Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollView}>
        <View style={styles.filtersContainer}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Tipo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipoFilter}
                onValueChange={(value) => setTipoFilter(value)}
                style={styles.picker}
              >
                <Picker.Item label="Todos" value="" />
                <Picker.Item label="Creación" value={TipoActividad.CREACION} />
                <Picker.Item label="Mantenimiento" value={TipoActividad.MANTENIMIENTO} />
                <Picker.Item label="Finalización" value={TipoActividad.FINALIZACION} />
              </Picker>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Subtipo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subtipoFilter}
                onValueChange={(value) => setSubtipoFilter(value)}
                style={styles.picker}
              >
                <Picker.Item label="Todos" value="" />
                <Picker.Item label="Siembra" value={SubtipoActividad.SIEMBRA} />
                <Picker.Item label="Riego" value={SubtipoActividad.RIEGO} />
                <Picker.Item label="Fertilización" value={SubtipoActividad.FERTILIZACION} />
                <Picker.Item label="Control de Plagas" value={SubtipoActividad.CONTROL_PLAGAS} />
                <Picker.Item label="Poda" value={SubtipoActividad.PODA} />
                <Picker.Item label="Cosecha" value={SubtipoActividad.COSECHA} />
                <Picker.Item label="Finalización" value={SubtipoActividad.FINALIZACION} />
                <Picker.Item label="Otra" value={SubtipoActividad.OTRA} />
              </Picker>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Desde</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={fechaInicioFilter}
              onChangeText={setFechaInicioFilter}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Hasta</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={fechaFinFilter}
              onChangeText={setFechaFinFilter}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Todas ({filteredActivities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'pendiente' && styles.activeTab]}
          onPress={() => handleTabChange('pendiente')}
        >
          <Text style={[styles.tabText, activeTab === 'pendiente' && styles.activeTabText]}>
            Pendientes ({filteredActivities.filter(a => a.estado === 'Pendiente').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'finalizada' && styles.activeTab]}
          onPress={() => handleTabChange('finalizada')}
        >
          <Text style={[styles.tabText, activeTab === 'finalizada' && styles.activeTabText]}>
            Finalizadas ({filteredActivities.filter(a => a.estado === 'Finalizada').length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No se encontraron actividades' : 'No hay actividades registradas'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery ? 'Intenta con otro término de búsqueda' : 'Crea tu primera actividad'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.loadingText}>Cargando actividades...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          renderItem={({ item }) => (
            <ActivityCard
              activity={item}
              onPress={() => handleCardPress(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshing={loading}
          onRefresh={refresh}
          stickyHeaderIndices={[0]}
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
            <ActivityFormScreen onClose={handleCloseModal} activity={selectedActivity} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  headerContainer: {
    backgroundColor: '#f9fafb',
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#166534',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(22, 101, 52, 0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    fontSize: 20,
    color: '#9ca3af',
    paddingHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTab: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'transparent',
    maxHeight: '90%',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  filtersScrollView: {
    maxHeight: 80,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  filterItem: {
    minWidth: 120,
  },
  filterLabel: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
});

export default ActivitiesListScreen;
