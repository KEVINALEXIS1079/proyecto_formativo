import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, ScrollView, Alert } from 'react-native';
import { Text, Searchbar, Card, Chip, Button, ActivityIndicator, IconButton, useTheme, Avatar, Divider } from 'react-native-paper';
import { Plus, Sprout, Calendar, MapPin, Filter, Eye, DollarSign } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { cropsAPI, API_URL } from '../../../shared/services/api';
import { Cultivo } from '../../../shared/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/context/AuthContext';

const CropsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { logout } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  const fetchCrops = useCallback(async (query: string = '') => {
    setLoading(true);
    try {
      const params: any = {};
      if (query) params.q = query;

      const response = await cropsAPI.getAll(params);
      const rawData = response.data;
      const data = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);
      setCrops(data);
    } catch (error: any) {
      console.error('Error fetching crops:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCrops(searchQuery);
    }, [fetchCrops])
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCrops(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchCrops]);

  // Use crops directly instead of filteredCrops
  const displayCrops = crops;

  const metrics = useMemo(() => {
    const total = crops.length;
    const activos = crops.filter((x) => x.estado === "ACTIVO" || x.estado === "activo").length;
    const finalizados = crops.filter((x) => x.estado === "FINALIZADO" || x.estado === "finalizado").length;
    return { total, activos, finalizados };
  }, [crops]);

  const renderMetrics = () => (
    <View style={styles.metricsContainer}>
      <Card style={[styles.metricCard, { flex: 1, marginRight: 8 }]}>
        <Card.Content style={{ paddingVertical: 12 }}>
          <Text variant="labelSmall" style={{ color: '#666' }}>Total</Text>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{metrics.total}</Text>
        </Card.Content>
      </Card>
      <Card style={[styles.metricCard, { flex: 1, marginRight: 8 }]}>
        <Card.Content style={{ paddingVertical: 12 }}>
          <Text variant="labelSmall" style={{ color: '#166534' }}>Activos</Text>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#166534' }}>{metrics.activos}</Text>
        </Card.Content>
      </Card>
      <Card style={[styles.metricCard, { flex: 1 }]}>
        <Card.Content style={{ paddingVertical: 12 }}>
          <Text variant="labelSmall" style={{ color: '#1e40af' }}>Finalizados</Text>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#1e40af' }}>{metrics.finalizados}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'activo') return '#166534';
    if (s === 'inactivo') return '#dc2626';
    if (s === 'finalizado') return '#1d4ed8';
    return '#666';
  };

  const getStatusBg = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'activo') return '#dcfce7';
    if (s === 'inactivo') return '#fee2e2';
    if (s === 'finalizado') return '#dbeafe';
    return '#f3f4f6';
  };

  const renderItem = ({ item }: { item: any }) => {
    const loteNombre = item.lote?.nombre || 'N/A';
    const subloteNombre = item.sublote?.nombre || item.subLote?.nombre || 'N/A';
    const tipoNombre = typeof item.tipoCultivo === 'object' ? item.tipoCultivo.nombre : (item.tipoCultivo || 'Tipo Desconocido');
    const color = getStatusColor(item.estado);
    const bgColor = getStatusBg(item.estado);
    const nombre = item.nombreCultivo || item.nombre || 'Cultivo sin nombre';

    // Logic for image URL
    let imagen = item.imgCultivo || item.imagen;
    if (imagen && !imagen.startsWith('http') && !imagen.startsWith('file')) {
      // If it's a relative path from backend (e.g. 'uploads/...')
      imagen = `${API_URL}/${imagen}`;
    }

    return (
      <Card style={styles.card} mode="elevated">
        {imagen ? (
          <Card.Cover source={{ uri: imagen }} style={styles.cardCover} />
        ) : (
          <View style={styles.placeholderCover}>
            <Sprout size={48} color="#10b981" />
          </View>
        )}

        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{nombre}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <Chip style={{ backgroundColor: '#f0fdf4' }} textStyle={{ color: '#166534', fontSize: 10, lineHeight: 14 }}>{tipoNombre}</Chip>
                <Chip style={{ backgroundColor: bgColor }} textStyle={{ color: color, fontSize: 10, lineHeight: 14 }}>{item.estado}</Chip>
              </View>
            </View>
          </View>

          <Text variant="bodyMedium" numberOfLines={2} style={{ color: '#666', marginTop: 8 }}>
            {item.descripcion || item.variedad || 'Sin descripción disponible.'}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#3b82f6" />
              <Text variant="bodySmall" style={{ color: '#4b5563', flex: 1 }}>
                Lote: {loteNombre} · {subloteNombre}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={14} color="#6366f1" />
              <Text variant="bodySmall" style={{ color: '#4b5563' }}>
                Siembra: {new Date(item.fechaSiembra).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View>
              <Text variant="labelSmall" style={{ color: '#666' }}>Inversión Estimada</Text>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {item.costoTotal ? `$${item.costoTotal.toLocaleString()}` : '$ 0'}
              </Text>
            </View>
            <Button
              mode="contained-tonal"
              buttonColor="#dcfce7"
              textColor="#14532d"
              icon={() => <Eye size={16} color="#14532d" />}
              onPress={() => setSelectedCrop(item)}
              compact
            >
              Ver
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#1f2937' }}>Gestión de Cultivos</Text>
          <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Administra tus cultivos y lotes</Text>
        </View>
        <Button
          mode="contained"
          buttonColor="#10b981"
          icon={() => <Plus size={20} color="white" />}
          onPress={() => navigation.navigate('CreateCrop')}
        >
          Nuevo
        </Button>
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar cultivos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          elevation={1}
          style={{ backgroundColor: '#fff', borderRadius: 12 }}
          inputStyle={{ minHeight: 40 }}
        />
      </View>

      <FlatList
        ListHeaderComponent={renderMetrics}
        data={displayCrops}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCrops} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text>No se encontraron cultivos.</Text>
            </View>
          ) : null
        }
      />

      {/* Crop Detail Modal */}
      {selectedCrop && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold', flex: 1 }}>Detalle del Cultivo</Text>
              <IconButton icon="close" size={24} onPress={() => setSelectedCrop(null)} />
            </View>

            <ScrollView style={styles.modalContent}>
              {(() => {
                let modalImg = selectedCrop.imgCultivo || selectedCrop.imagen;
                if (modalImg && !modalImg.startsWith('http') && !modalImg.startsWith('file')) {
                  modalImg = `${API_URL}/${modalImg}`;
                }

                return modalImg ? (
                  <Image source={{ uri: modalImg }} style={styles.modalImage} />
                ) : (
                  <View style={styles.modalPlaceholderImage}>
                    <Sprout size={64} color="#10b981" />
                  </View>
                );
              })()}

              <View style={styles.modalBody}>
                <Text variant="headlineSmall" style={styles.modalTitle}>{selectedCrop.nombreCultivo || selectedCrop.nombre}</Text>

                <View style={styles.statusContainer}>
                  <Chip style={{ backgroundColor: getStatusBg(selectedCrop.estado) }} textStyle={{ color: getStatusColor(selectedCrop.estado) }}>
                    {selectedCrop.estado}
                  </Chip>
                  <Text style={{ color: '#666' }}>{typeof selectedCrop.tipoCultivo === 'object' ? selectedCrop.tipoCultivo.nombre : selectedCrop.tipoCultivo}</Text>
                </View>

                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.descriptionText}>{selectedCrop.descripcion || 'Sin descripción'}</Text>

                {selectedCrop.motivo && (
                  <>
                    <Text style={styles.sectionTitle}>Motivo</Text>
                    <Text style={styles.descriptionText}>{selectedCrop.motivo}</Text>
                  </>
                )}

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Ubicación</Text>
                <View style={styles.infoRow}>
                  <MapPin size={18} color="#3b82f6" />
                  <Text style={styles.infoText}>Lote: {selectedCrop.lote?.nombre || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={{ width: 18 }} />
                  <Text style={styles.infoText}>Sublote: {selectedCrop.sublote?.nombre || selectedCrop.subLote?.nombre || 'N/A'}</Text>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Fechas</Text>
                <View style={styles.infoRow}>
                  <Calendar size={18} color="#6366f1" />
                  <Text style={styles.infoText}>Siembra: {new Date(selectedCrop.fechaSiembra).toLocaleDateString()}</Text>
                </View>
                {selectedCrop.fechaFinalizacion && (
                  <View style={styles.infoRow}>
                    <View style={{ width: 18 }} />
                    <Text style={styles.infoText}>Finalización (Est): {new Date(selectedCrop.fechaFinalizacion).toLocaleDateString()}</Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Finanzas</Text>
                <View style={styles.infoRow}>
                  <DollarSign size={18} color="#16a34a" />
                  <Text style={styles.infoText}>Inversión: ${selectedCrop.costoTotal ? selectedCrop.costoTotal.toLocaleString() : '0'}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                buttonColor="#16a34a"
                onPress={() => {
                  navigation.navigate('CreateCrop', { crop: selectedCrop });
                  setSelectedCrop(null);
                }}
                icon="pencil"
                style={{ flex: 1 }}
              >
                Editar
              </Button>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardCover: {
    height: 150,
  },
  placeholderCover: {
    height: 100,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsGrid: {
    marginTop: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalPlaceholderImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  divider: {
    marginVertical: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

export default CropsListScreen;
