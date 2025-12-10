import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Platform
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { activitiesAPI } from '../../../shared/services/api';
import { geoAPI, cropsAPI } from '../../../shared/services/api';
import {
  Activity, CreateActivityDto, TipoActividad, SubtipoActividad,
  CreateActivityResponsableDto, CreateActivityInsumoDto, CreateActivityServicioDto, CreateActivityEvidenciaDto,
  ActivityCostSummary
} from '../types';
import { Picker } from '@react-native-picker/picker';
import ResponsableItem from '../components/ResponsableItem';
import InsumoItem from '../components/InsumoItem';
import ServicioItem from '../components/ServicioItem';
import EvidenciaCard from '../components/EvidenciaCard';
import CostSummary from '../components/CostSummary';
import ResponsableModal from '../components/ResponsableModal';
import InsumoModal from '../components/InsumoModal';
import ServicioModal from '../components/ServicioModal';
import EvidenciaModal from '../components/EvidenciaModal';

interface ActivityFormProps {
  onClose: () => void;
  activity?: Activity;
}

type TabType = 'info' | 'responsables' | 'insumos' | 'servicios' | 'evidencias';

const ActivityFormScreen: React.FC<ActivityFormProps> = ({ onClose, activity }) => {
  const [form, setForm] = useState({
    nombre: '',
    tipo: TipoActividad.MANTENIMIENTO,
    subtipo: SubtipoActividad.OTRA,
    fecha: '',
    descripcion: '',
    loteId: undefined as number | undefined,
    subLoteId: undefined as number | undefined,
    cultivoId: undefined as number | undefined,
    horasActividad: '',
    precioHoraActividad: '',
  });
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<any[]>([]);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Arrays for related entities
  const [responsables, setResponsables] = useState<CreateActivityResponsableDto[]>([]);
  const [insumos, setInsumos] = useState<CreateActivityInsumoDto[]>([]);
  const [servicios, setServicios] = useState<CreateActivityServicioDto[]>([]);
  const [evidencias, setEvidencias] = useState<CreateActivityEvidenciaDto[]>([]);

  // Modal states
  const [responsableModalVisible, setResponsableModalVisible] = useState(false);
  const [insumoModalVisible, setInsumoModalVisible] = useState(false);
  const [servicioModalVisible, setServicioModalVisible] = useState(false);
  const [evidenciaModalVisible, setEvidenciaModalVisible] = useState(false);

  // Selected items for editing
  const [selectedResponsableIndex, setSelectedResponsableIndex] = useState<number | undefined>(undefined);
  const [selectedInsumoIndex, setSelectedInsumoIndex] = useState<number | undefined>(undefined);
  const [selectedServicioIndex, setSelectedServicioIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
    if (activity) {
      setForm({
        nombre: activity.nombre,
        tipo: activity.tipo,
        subtipo: activity.subtipo,
        fecha: activity.fecha.split('T')[0],
        descripcion: activity.descripcion || '',
        loteId: activity.loteId,
        subLoteId: activity.subLoteId,
        cultivoId: activity.cultivoId,
        horasActividad: activity.horasActividad?.toString() || '',
        precioHoraActividad: activity.precioHoraActividad?.toString() || '',
      });

      // Load related entities for editing
      if (activity.responsables) {
        setResponsables(activity.responsables.map(r => ({
          usuarioId: r.usuarioId,
          horas: r.horas,
          precioHora: r.precioHora,
        })));
      }
      if (activity.insumosUso) {
        setInsumos(activity.insumosUso.map(i => ({
          insumoId: i.insumoId,
          cantidadUso: i.cantidadUso,
          costoUnitarioUso: i.costoUnitarioUso,
        })));
      }
      if (activity.servicios) {
        setServicios(activity.servicios.map(s => ({
          nombreServicio: s.nombreServicio,
          horas: s.horas,
          precioHora: s.precioHora,
        })));
      }
      if (activity.evidencias) {
        setEvidencias(activity.evidencias.map(e => ({
          descripcion: e.descripcion || '',
          imagenes: e.imagenes,
        })));
      }
    }
  }, [activity]);

  const loadData = async () => {
    try {
      const [lotesRes, subLotesRes, cultivosRes] = await Promise.all([
        geoAPI.getLotes(),
        geoAPI.getSubLotes(),
        cropsAPI.getAll()
      ]);
      setLotes(lotesRes.data || []);
      setSubLotes(subLotesRes.data || []);
      setCultivos(cultivosRes.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar datos de lotes, sublotes y cultivos';
      Alert.alert('Error', errorMessage);
    }
  };

  const validateForm = () => {
    if (!form.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la actividad es requerido');
      return false;
    }

    if (form.nombre.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return false;
    }

    if (!form.fecha) {
      Alert.alert('Error', 'La fecha es requerida');
      return false;
    }

    // Validar formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.fecha)) {
      Alert.alert('Error', 'El formato de fecha debe ser YYYY-MM-DD');
      return false;
    }

    // Validar que la fecha no sea futura
    const selectedDate = new Date(form.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      Alert.alert('Error', 'La fecha no puede ser futura');
      return false;
    }

    // Validar horas y precio si se proporcionan
    if (form.horasActividad) {
      const horas = parseFloat(form.horasActividad);
      if (isNaN(horas) || horas < 0) {
        Alert.alert('Error', 'Las horas deben ser un número positivo');
        return false;
      }
    }

    if (form.precioHoraActividad) {
      const precio = parseFloat(form.precioHoraActividad);
      if (isNaN(precio) || precio < 0) {
        Alert.alert('Error', 'El precio por hora debe ser un número positivo');
        return false;
      }
    }

    return true;
  };

  const calculateCostSummary = (): ActivityCostSummary => {
    const costoMO = (parseFloat(form.horasActividad) || 0) * (parseFloat(form.precioHoraActividad) || 0);
    const costoResponsables = responsables.reduce((sum, r) => sum + ((r.horas || 0) * (r.precioHora || 0)), 0);
    const costoInsumos = insumos.reduce((sum, i) => sum + (i.cantidadUso * i.costoUnitarioUso), 0);
    const costoServicios = servicios.reduce((sum, s) => sum + (s.horas * s.precioHora), 0);

    const costoManoObraTotal = costoMO + costoResponsables;
    const costoTotal = costoManoObraTotal + costoInsumos + costoServicios;

    return {
      costoManoObra: costoManoObraTotal,
      costoInsumos,
      costoServicios,
      costoTotal
    };
  };

  // Filtered data for cascaded selects
  const filteredSubLotes = form.loteId ? subLotes.filter(sl => sl.loteId === form.loteId) : [];
  const filteredCultivos = form.subLoteId ? cultivos.filter(c => c.subLoteId === form.subLoteId) : [];

  // Responsables handlers
  const handleAddResponsable = async (data: any) => {
    setResponsables([...responsables, data]);
  };

  const handleEditResponsable = (index: number) => {
    setSelectedResponsableIndex(index);
    setResponsableModalVisible(true);
  };

  const handleUpdateResponsable = async (data: any) => {
    if (selectedResponsableIndex !== undefined) {
      const newResponsables = [...responsables];
      newResponsables[selectedResponsableIndex] = data;
      setResponsables(newResponsables);
      setSelectedResponsableIndex(undefined);
    }
  };

  const handleDeleteResponsable = (index: number) => {
    Alert.alert(
      "Eliminar Responsable",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setResponsables(responsables.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // Insumos handlers
  const handleAddInsumo = async (data: any) => {
    setInsumos([...insumos, data]);
  };

  const handleEditInsumo = (index: number) => {
    setSelectedInsumoIndex(index);
    setInsumoModalVisible(true);
  };

  const handleUpdateInsumo = async (data: any) => {
    if (selectedInsumoIndex !== undefined) {
      const newInsumos = [...insumos];
      newInsumos[selectedInsumoIndex] = data;
      setInsumos(newInsumos);
      setSelectedInsumoIndex(undefined);
    }
  };

  const handleDeleteInsumo = (index: number) => {
    Alert.alert(
      "Eliminar Insumo",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setInsumos(insumos.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // Servicios handlers
  const handleAddServicio = async (data: any) => {
    setServicios([...servicios, data]);
  };

  const handleEditServicio = (index: number) => {
    setSelectedServicioIndex(index);
    setServicioModalVisible(true);
  };

  const handleUpdateServicio = async (data: any) => {
    if (selectedServicioIndex !== undefined) {
      const newServicios = [...servicios];
      newServicios[selectedServicioIndex] = data;
      setServicios(newServicios);
      setSelectedServicioIndex(undefined);
    }
  };

  const handleDeleteServicio = (index: number) => {
    Alert.alert(
      "Eliminar Servicio",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setServicios(servicios.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // Evidencias handlers
  const handleAddEvidencia = async (data: any) => {
    setEvidencias([...evidencias, data]);
  };

  const handleDeleteEvidencia = (index: number) => {
    Alert.alert(
      "Eliminar Evidencia",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setEvidencias(evidencias.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const horasActividad = parseFloat(form.horasActividad) || 0;
      const precioHoraActividad = parseFloat(form.precioHoraActividad) || 0;
      const costoManoObra = horasActividad * precioHoraActividad;

      const data: any = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        subtipo: form.subtipo,
        fecha: form.fecha,
        descripcion: form.descripcion?.trim() || undefined,
        loteId: form.loteId,
        subLoteId: form.subLoteId,
        cultivoId: form.cultivoId,
        horasActividad,
        precioHoraActividad,
        costoManoObra,
        responsables: responsables.length > 0 ? responsables : undefined,
        insumos: insumos.length > 0 ? insumos : undefined,
        servicios: servicios.length > 0 ? servicios : undefined,
        evidencias: evidencias.length > 0 ? evidencias : undefined,
      };

      if (activity) {
        await activitiesAPI.update(activity.id, data);
        Alert.alert('Éxito', 'Actividad actualizada correctamente');
      } else {
        await activitiesAPI.create(data);
        Alert.alert('Éxito', 'Actividad creada correctamente');
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving activity:', error);
      const errorMessage = error.response?.data?.message || 'No se pudo guardar la actividad';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {activity ? 'Editar Actividad' : 'Nueva Actividad'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#6b7280" />
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
              Información
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'responsables' && styles.activeTab]}
            onPress={() => setActiveTab('responsables')}
          >
            <Text style={[styles.tabText, activeTab === 'responsables' && styles.activeTabText]}>
              Responsables ({responsables.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'insumos' && styles.activeTab]}
            onPress={() => setActiveTab('insumos')}
          >
            <Text style={[styles.tabText, activeTab === 'insumos' && styles.activeTabText]}>
              Insumos ({insumos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'servicios' && styles.activeTab]}
            onPress={() => setActiveTab('servicios')}
          >
            <Text style={[styles.tabText, activeTab === 'servicios' && styles.activeTabText]}>
              Servicios ({servicios.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'evidencias' && styles.activeTab]}
            onPress={() => setActiveTab('evidencias')}
          >
            <Text style={[styles.tabText, activeTab === 'evidencias' && styles.activeTabText]}>
              Evidencias ({evidencias.length})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && (
          <>
            {/* Nombre */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de la Actividad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Fertilización Lote Norte"
                value={form.nombre}
                onChangeText={(text) => setForm({ ...form, nombre: text })}
              />
            </View>

            {/* Tipo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.tipo}
                  onValueChange={(value) => setForm({ ...form, tipo: value as TipoActividad })}
                  style={styles.picker}
                >
                  <Picker.Item label="Creación" value={TipoActividad.CREACION} />
                  <Picker.Item label="Mantenimiento" value={TipoActividad.MANTENIMIENTO} />
                  <Picker.Item label="Finalización" value={TipoActividad.FINALIZACION} />
                </Picker>
              </View>
            </View>

            {/* Subtipo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Subtipo *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.subtipo}
                  onValueChange={(value) => setForm({ ...form, subtipo: value as SubtipoActividad })}
                  style={styles.picker}
                >
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

            {/* Fecha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={form.fecha}
                onChangeText={(text) => setForm({ ...form, fecha: text })}
              />
            </View>

            {/* Lote */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lote (Opcional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.loteId}
                  onValueChange={(value) => setForm({ ...form, loteId: value, subLoteId: undefined, cultivoId: undefined })}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar lote..." value={undefined} />
                  {lotes.map((lote) => (
                    <Picker.Item key={lote.id} label={lote.nombre} value={lote.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* SubLote */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sublote (Opcional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.subLoteId}
                  onValueChange={(value) => setForm({ ...form, subLoteId: value, cultivoId: undefined })}
                  style={styles.picker}
                  enabled={!!form.loteId}
                >
                  <Picker.Item label="Seleccionar sublote..." value={undefined} />
                  {filteredSubLotes.map((subLote) => (
                    <Picker.Item key={subLote.id} label={subLote.nombre} value={subLote.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Cultivo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cultivo (Opcional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.cultivoId}
                  onValueChange={(value) => setForm({ ...form, cultivoId: value })}
                  style={styles.picker}
                  enabled={!!form.subLoteId}
                >
                  <Picker.Item label="Seleccionar cultivo..." value={undefined} />
                  {filteredCultivos.map((cultivo) => (
                    <Picker.Item key={cultivo.id} label={cultivo.nombre} value={cultivo.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Horas de Actividad */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Horas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={form.horasActividad}
                  onChangeText={(text) => setForm({ ...form, horasActividad: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Precio/Hora</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={form.precioHoraActividad}
                  onChangeText={(text) => setForm({ ...form, precioHoraActividad: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Costo MO Calculado */}
            {(form.horasActividad || form.precioHoraActividad) && (
              <View style={styles.costoContainer}>
                <Text style={styles.costoLabel}>Costo Mano de Obra:</Text>
                <Text style={styles.costoValue}>
                  ${((parseFloat(form.horasActividad) || 0) * (parseFloat(form.precioHoraActividad) || 0)).toLocaleString('es-CO')}
                </Text>
              </View>
            )}

            {/* Descripción */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Detalles adicionales..."
                value={form.descripcion}
                onChangeText={(text) => setForm({ ...form, descripcion: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Costos Calculados */}
            <CostSummary summary={calculateCostSummary()} />
          </>
        )}

        {activeTab === 'responsables' && (
          <View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setSelectedResponsableIndex(undefined);
                setResponsableModalVisible(true);
              }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Agregar Responsable</Text>
            </TouchableOpacity>

            {responsables.length > 0 ? (
              responsables.map((responsable, index) => (
                <ResponsableItem
                  key={index}
                  responsable={{
                    ...responsable,
                    id: index,
                    actividadId: 0, // Placeholder
                    costo: (responsable.horas || 0) * (responsable.precioHora || 0),
                    usuario: { id: responsable.usuarioId, nombre: '', apellido: '' } // Placeholder
                  } as any}
                  onEdit={() => handleEditResponsable(index)}
                  onDelete={() => handleDeleteResponsable(index)}
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
                setSelectedInsumoIndex(undefined);
                setInsumoModalVisible(true);
              }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Agregar Insumo</Text>
            </TouchableOpacity>

            {insumos.length > 0 ? (
              insumos.map((insumo, index) => (
                <InsumoItem
                  key={index}
                  insumo={{
                    ...insumo,
                    id: index,
                    actividadId: 0, // Placeholder
                    costoTotal: insumo.cantidadUso * insumo.costoUnitarioUso,
                    insumo: { id: insumo.insumoId, nombre: '', unidad: '', cantidad: 0 } // Placeholder
                  } as any}
                  onEdit={() => handleEditInsumo(index)}
                  onDelete={() => handleDeleteInsumo(index)}
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
                setSelectedServicioIndex(undefined);
                setServicioModalVisible(true);
              }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Agregar Servicio</Text>
            </TouchableOpacity>

            {servicios.length > 0 ? (
              servicios.map((servicio, index) => (
                <ServicioItem
                  key={index}
                  servicio={{
                    ...servicio,
                    id: index,
                    actividadId: 0, // Placeholder
                    costo: servicio.horas * servicio.precioHora
                  } as any}
                  onEdit={() => handleEditServicio(index)}
                  onDelete={() => handleDeleteServicio(index)}
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

            {evidencias.length > 0 ? (
              evidencias.map((evidencia, index) => (
                <EvidenciaCard
                  key={index}
                  evidencia={{
                    ...evidencia,
                    id: index,
                    actividadId: 0 // Placeholder
                  } as any}
                  onDelete={() => handleDeleteEvidencia(index)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No hay evidencias cargadas</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <ResponsableModal
        visible={responsableModalVisible}
        onClose={() => {
          setResponsableModalVisible(false);
          setSelectedResponsableIndex(undefined);
        }}
        onSave={selectedResponsableIndex !== undefined ? handleUpdateResponsable : handleAddResponsable}
        responsable={selectedResponsableIndex !== undefined ? (responsables[selectedResponsableIndex] as any) : undefined}
      />

      <InsumoModal
        visible={insumoModalVisible}
        onClose={() => {
          setInsumoModalVisible(false);
          setSelectedInsumoIndex(undefined);
        }}
        onSave={selectedInsumoIndex !== undefined ? handleUpdateInsumo : handleAddInsumo}
        insumo={selectedInsumoIndex !== undefined ? (insumos[selectedInsumoIndex] as any) : undefined}
      />

      <ServicioModal
        visible={servicioModalVisible}
        onClose={() => {
          setServicioModalVisible(false);
          setSelectedServicioIndex(undefined);
        }}
        onSave={selectedServicioIndex !== undefined ? handleUpdateServicio : handleAddServicio}
        servicio={selectedServicioIndex !== undefined ? (servicios[selectedServicioIndex] as any) : undefined}
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
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
    maxHeight: 500,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  costoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  costoLabel: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  costoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#166534',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#166534',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: '#6b7280',
  },
  tabsScrollView: {
    maxHeight: 60,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 70,
  },
  activeTab: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
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

export default ActivityFormScreen;
