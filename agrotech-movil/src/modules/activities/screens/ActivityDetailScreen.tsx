import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import {
  ArrowLeft, Edit2, Trash2, CheckCircle, Clock,
  MapPin, Sprout, Calendar, Plus
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { activitiesAPI } from '../../../shared/services/api';
import { Activity, ActivityCostSummary, TipoActividad, ActivityResponsable, ActivityInsumoUso, ActivityServicio } from '../types';
import ResponsableItem from '../components/ResponsableItem';
import InsumoItem from '../components/InsumoItem';
import ServicioItem from '../components/ServicioItem';
import EvidenciaCard from '../components/EvidenciaCard';
import CostSummary from '../components/CostSummary';
import ResponsableModal from '../components/ResponsableModal';
import InsumoModal from '../components/InsumoModal';
import ServicioModal from '../components/ServicioModal';
import EvidenciaModal from '../components/EvidenciaModal';

type RootStackParamList = {
  ActivityDetail: { activityId: number };
};

type ActivityDetailRouteProp = RouteProp<RootStackParamList, 'ActivityDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'info' | 'responsables' | 'insumos' | 'servicios' | 'evidencias';

const ActivityDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ActivityDetailRouteProp>();
  const { activityId } = route.params;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Modal states
  const [responsableModalVisible, setResponsableModalVisible] = useState(false);
  const [insumoModalVisible, setInsumoModalVisible] = useState(false);
  const [servicioModalVisible, setServicioModalVisible] = useState(false);
  const [evidenciaModalVisible, setEvidenciaModalVisible] = useState(false);

  // Selected items for editing
  const [selectedResponsable, setSelectedResponsable] = useState<ActivityResponsable | undefined>(undefined);
  const [selectedInsumo, setSelectedInsumo] = useState<ActivityInsumoUso | undefined>(undefined);
  const [selectedServicio, setSelectedServicio] = useState<ActivityServicio | undefined>(undefined);

  const fetchActivity = async () => {
    try {
      const response = await activitiesAPI.getOne(activityId);
      setActivity(response.data);
    } catch (error) {
      console.error('Error fetching activity:', error);
      Alert.alert('Error', 'No se pudo cargar la actividad');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivity();
  };

  const handleDelete = () => {
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
              await activitiesAPI.delete(activityId);
              Alert.alert('Éxito', 'Actividad eliminada');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la actividad');
            }
          }
        }
      ]
    );
  };

  const handleChangeStatus = () => {
    if (!activity) return;
    
    const nuevoEstado = activity.estado === 'Pendiente' ? 'Finalizada' : 'Pendiente';
    
    Alert.alert(
      "Cambiar Estado",
      `¿Cambiar estado a ${nuevoEstado}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await activitiesAPI.changeStatus(activityId, nuevoEstado);
              Alert.alert('Éxito', 'Estado actualizado');
              fetchActivity();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cambiar el estado');
            }
          }
        }
      ]
    );
  };

  // Responsables handlers
  const handleAddResponsable = async (data: any) => {
    try {
      await activitiesAPI.addResponsable(activityId, data);
      Alert.alert('Éxito', 'Responsable agregado');
      fetchActivity();
    } catch (error) {
      throw error;
    }
  };

  const handleEditResponsable = (responsable: ActivityResponsable) => {
    setSelectedResponsable(responsable);
    setResponsableModalVisible(true);
  };

  const handleUpdateResponsable = async (data: any) => {
    if (!selectedResponsable) return;
    try {
      await activitiesAPI.updateResponsable(activityId, selectedResponsable.id, data);
      Alert.alert('Éxito', 'Responsable actualizado');
      fetchActivity();
      setSelectedResponsable(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteResponsable = (responsableId: number) => {
    Alert.alert(
      "Eliminar Responsable",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await activitiesAPI.removeResponsable(activityId, responsableId);
              Alert.alert('Éxito', 'Responsable eliminado');
              fetchActivity();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  // Insumos handlers
  const handleAddInsumo = async (data: any) => {
    try {
      await activitiesAPI.addInsumo(activityId, data);
      Alert.alert('Éxito', 'Insumo agregado');
      fetchActivity();
    } catch (error) {
      throw error;
    }
  };

  const handleEditInsumo = (insumo: ActivityInsumoUso) => {
    setSelectedInsumo(insumo);
    setInsumoModalVisible(true);
  };

  const handleUpdateInsumo = async (data: any) => {
    if (!selectedInsumo) return;
    try {
      await activitiesAPI.updateInsumo(activityId, selectedInsumo.id, data);
      Alert.alert('Éxito', 'Insumo actualizado');
      fetchActivity();
      setSelectedInsumo(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteInsumo = (insumoId: number) => {
    Alert.alert(
      "Eliminar Insumo",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await activitiesAPI.removeInsumo(activityId, insumoId);
              Alert.alert('Éxito', 'Insumo eliminado');
              fetchActivity();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  // Servicios handlers
  const handleAddServicio = async (data: any) => {
    try {
      await activitiesAPI.addServicio(activityId, data);
      Alert.alert('Éxito', 'Servicio agregado');
      fetchActivity();
    } catch (error) {
      throw error;
    }
  };

  const handleEditServicio = (servicio: ActivityServicio) => {
    setSelectedServicio(servicio);
    setServicioModalVisible(true);
  };

  const handleUpdateServicio = async (data: any) => {
    if (!selectedServicio) return;
    try {
      await activitiesAPI.updateServicio(activityId, selectedServicio.id, data);
      Alert.alert('Éxito', 'Servicio actualizado');
      fetchActivity();
      setSelectedServicio(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteServicio = (servicioId: number) => {
    Alert.alert(
      "Eliminar Servicio",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await activitiesAPI.removeServicio(activityId, servicioId);
              Alert.alert('Éxito', 'Servicio eliminado');
              fetchActivity();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  // Evidencias handlers
  const handleAddEvidencia = async (data: any) => {
    try {
      await activitiesAPI.addEvidencia(activityId, data);
      Alert.alert('Éxito', 'Evidencia agregada');
      fetchActivity();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteEvidencia = (evidenciaId: number) => {
    Alert.alert(
      "Eliminar Evidencia",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await activitiesAPI.removeEvidencia(activityId, evidenciaId);
              Alert.alert('Éxito', 'Evidencia eliminada');
              fetchActivity();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  const calculateCostSummary = (): ActivityCostSummary => {
    if (!activity) {
      return { costoManoObra: 0, costoInsumos: 0, costoServicios: 0, costoTotal: 0 };
    }

    const costoMO = activity.costoManoObra || 0;
    const costoResponsables = activity.responsables?.reduce((sum, r) => sum + r.costo, 0) || 0;
    const costoInsumos = activity.insumosUso?.reduce((sum, i) => sum + i.costoTotal, 0) || 0;
    const costoServicios = activity.servicios?.reduce((sum, s) => sum + s.costo, 0) || 0;

    const costoManoObraTotal = costoMO + costoResponsables;
    const costoTotal = costoManoObraTotal + costoInsumos + costoServicios;

    return {
      costoManoObra: costoManoObraTotal,
      costoInsumos,
      costoServicios,
      costoTotal
    };
  };

  const getTipoColor = (tipo: TipoActividad) => {
    switch (tipo) {
      case TipoActividad.CREACION:
        return '#16a34a';
      case TipoActividad.MANTENIMIENTO:
        return '#2563eb';
      case TipoActividad.FINALIZACION:
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Cargando actividad...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Actividad no encontrada</Text>
      </View>
    );
  }

  const isPendiente = activity.estado === 'Pendiente';
  const tipoColor = getTipoColor(activity.tipo);
  const costSummary = calculateCostSummary();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Actividad</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Trash2 size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#166534']} />
        }
      >
        {/* Activity Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.nombre}>{activity.nombre}</Text>
            <View style={[styles.estadoBadge, isPendiente ? styles.pendienteBadge : styles.finalizadaBadge]}>
              <Text style={styles.estadoText}>{activity.estado}</Text>
            </View>
          </View>

          {activity.descripcion && (
            <Text style={styles.descripcion}>{activity.descripcion}</Text>
          )}

          <View style={styles.badges}>
            <View style={[styles.tipoBadge, { backgroundColor: `${tipoColor}15` }]}>
              <Text style={[styles.tipoText, { color: tipoColor }]}>
                {activity.tipo}
              </Text>
            </View>
            <View style={styles.subtipoBadge}>
              <Text style={styles.subtipoText}>{activity.subtipo}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Fecha:</Text>
              <Text style={styles.detailValue}>
                {new Date(activity.fecha).toLocaleDateString('es-ES')}
              </Text>
            </View>

            {activity.lote && (
              <View style={styles.detailItem}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Lote:</Text>
                <Text style={styles.detailValue}>{activity.lote.nombre}</Text>
              </View>
            )}

            {activity.cultivo && (
              <View style={styles.detailItem}>
                <Sprout size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Cultivo:</Text>
                <Text style={styles.detailValue}>{activity.cultivo.nombre}</Text>
              </View>
            )}

            {activity.horasActividad > 0 && (
              <View style={styles.detailItem}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Horas:</Text>
                <Text style={styles.detailValue}>{activity.horasActividad}h</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.statusButton} onPress={handleChangeStatus}>
            <CheckCircle size={20} color="#fff" />
            <Text style={styles.statusButtonText}>
              Marcar como {isPendiente ? 'Finalizada' : 'Pendiente'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollView}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
                Costos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'responsables' && styles.activeTab]}
              onPress={() => setActiveTab('responsables')}
            >
              <Text style={[styles.tabText, activeTab === 'responsables' && styles.activeTabText]}>
                Responsables ({activity.responsables?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'insumos' && styles.activeTab]}
              onPress={() => setActiveTab('insumos')}
            >
              <Text style={[styles.tabText, activeTab === 'insumos' && styles.activeTabText]}>
                Insumos ({activity.insumosUso?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'servicios' && styles.activeTab]}
              onPress={() => setActiveTab('servicios')}
            >
              <Text style={[styles.tabText, activeTab === 'servicios' && styles.activeTabText]}>
                Servicios ({activity.servicios?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'evidencias' && styles.activeTab]}
              onPress={() => setActiveTab('evidencias')}
            >
              <Text style={[styles.tabText, activeTab === 'evidencias' && styles.activeTabText]}>
                Evidencias ({activity.evidencias?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'info' && (
            <CostSummary summary={costSummary} />
          )}

          {activeTab === 'responsables' && (
            <View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedResponsable(undefined);
                  setResponsableModalVisible(true);
                }}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar Responsable</Text>
              </TouchableOpacity>

              {activity.responsables && activity.responsables.length > 0 ? (
                activity.responsables.map(responsable => (
                  <ResponsableItem
                    key={responsable.id}
                    responsable={responsable}
                    onEdit={() => handleEditResponsable(responsable)}
                    onDelete={() => handleDeleteResponsable(responsable.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No hay responsables asignados</Text>
              )}
            </View>
          )}

          {activeTab === 'insumos' && (
            <View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedInsumo(undefined);
                  setInsumoModalVisible(true);
                }}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar Insumo</Text>
              </TouchableOpacity>

              {activity.insumosUso && activity.insumosUso.length > 0 ? (
                activity.insumosUso.map(insumo => (
                  <InsumoItem
                    key={insumo.id}
                    insumo={insumo}
                    onEdit={() => handleEditInsumo(insumo)}
                    onDelete={() => handleDeleteInsumo(insumo.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No hay insumos registrados</Text>
              )}
            </View>
          )}

          {activeTab === 'servicios' && (
            <View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedServicio(undefined);
                  setServicioModalVisible(true);
                }}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar Servicio</Text>
              </TouchableOpacity>

              {activity.servicios && activity.servicios.length > 0 ? (
                activity.servicios.map(servicio => (
                  <ServicioItem
                    key={servicio.id}
                    servicio={servicio}
                    onEdit={() => handleEditServicio(servicio)}
                    onDelete={() => handleDeleteServicio(servicio.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No hay servicios contratados</Text>
              )}
            </View>
          )}

          {activeTab === 'evidencias' && (
            <View>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setEvidenciaModalVisible(true)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar Evidencia</Text>
              </TouchableOpacity>

              {activity.evidencias && activity.evidencias.length > 0 ? (
                activity.evidencias.map(evidencia => (
                  <EvidenciaCard 
                    key={evidencia.id} 
                    evidencia={evidencia}
                    onDelete={() => handleDeleteEvidencia(evidencia.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No hay evidencias cargadas</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <ResponsableModal
        visible={responsableModalVisible}
        onClose={() => {
          setResponsableModalVisible(false);
          setSelectedResponsable(undefined);
        }}
        onSave={selectedResponsable ? handleUpdateResponsable : handleAddResponsable}
        responsable={selectedResponsable}
      />

      <InsumoModal
        visible={insumoModalVisible}
        onClose={() => {
          setInsumoModalVisible(false);
          setSelectedInsumo(undefined);
        }}
        onSave={selectedInsumo ? handleUpdateInsumo : handleAddInsumo}
        insumo={selectedInsumo}
      />

      <ServicioModal
        visible={servicioModalVisible}
        onClose={() => {
          setServicioModalVisible(false);
          setSelectedServicio(undefined);
        }}
        onSave={selectedServicio ? handleUpdateServicio : handleAddServicio}
        servicio={selectedServicio}
      />

      <EvidenciaModal
        visible={evidenciaModalVisible}
        onClose={() => setEvidenciaModalVisible(false)}
        onSave={handleAddEvidencia}
      />
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
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendienteBadge: {
    backgroundColor: '#fef3c7',
  },
  finalizadaBadge: {
    backgroundColor: '#d1fae5',
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  descripcion: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tipoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtipoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  subtipoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tabsScrollView: {
    maxHeight: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9ca3af',
    paddingVertical: 40,
  },
});

export default ActivityDetailScreen;
