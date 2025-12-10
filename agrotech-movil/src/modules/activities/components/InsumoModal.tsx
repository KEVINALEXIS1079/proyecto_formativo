import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Platform
} from 'react-native';
import { X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { inventoryAPI } from '../../../shared/services/api';
import { Insumo } from '../../../shared/types';
import { ActivityInsumoUso, CreateActivityInsumoDto } from '../types';

interface InsumoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateActivityInsumoDto) => Promise<void>;
  insumo?: ActivityInsumoUso;
}

const InsumoModal: React.FC<InsumoModalProps> = ({
  visible,
  onClose,
  onSave,
  insumo
}) => {
  const [form, setForm] = useState({
    insumoId: undefined as number | undefined,
    cantidadUso: '',
    costoUnitarioUso: '',
    descripcion: '',
  });
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInsumos, setLoadingInsumos] = useState(false);

  useEffect(() => {
    if (visible) {
      loadInsumos();
      if (insumo) {
        setForm({
          insumoId: insumo.insumoId,
          cantidadUso: insumo.cantidadUso.toString(),
          costoUnitarioUso: insumo.costoUnitarioUso.toString(),
          descripcion: '',
        });
      } else {
        setForm({
          insumoId: undefined,
          cantidadUso: '',
          costoUnitarioUso: '',
          descripcion: '',
        });
      }
    }
  }, [visible, insumo]);

  const loadInsumos = async () => {
    setLoadingInsumos(true);
    try {
      const response = await inventoryAPI.getAll();
      setInsumos(response.data || []);
    } catch (error) {
      console.error('Error loading insumos:', error);
      Alert.alert('Error', 'No se pudieron cargar los insumos');
    } finally {
      setLoadingInsumos(false);
    }
  };

  const handleInsumoChange = (insumoId: number | undefined) => {
    setForm({ ...form, insumoId });
    if (insumoId) {
      const selected = insumos.find(i => i.id === insumoId);
      setSelectedInsumo(selected || null);
      if (selected && !form.costoUnitarioUso) {
        setForm(prev => ({
          ...prev,
          insumoId,
          costoUnitarioUso: selected.costoUnitario.toString()
        }));
      }
    } else {
      setSelectedInsumo(null);
    }
  };

  const handleSave = async () => {
    if (!form.insumoId) {
      Alert.alert('Error', 'Por favor selecciona un insumo');
      return;
    }

    const cantidadUso = parseFloat(form.cantidadUso) || 0;
    const costoUnitarioUso = parseFloat(form.costoUnitarioUso) || 0;

    if (cantidadUso <= 0 || costoUnitarioUso <= 0) {
      Alert.alert('Error', 'La cantidad y el costo deben ser mayores a 0');
      return;
    }

    // Validar stock disponible
    if (selectedInsumo && cantidadUso > selectedInsumo.cantidad) {
      Alert.alert(
        'Stock Insuficiente',
        `Solo hay ${selectedInsumo.cantidad} ${selectedInsumo.unidad} disponibles`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await onSave({
        insumoId: form.insumoId,
        cantidadUso,
        costoUnitarioUso,
        descripcion: form.descripcion || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error saving insumo:', error);
      Alert.alert('Error', 'No se pudo guardar el insumo');
    } finally {
      setLoading(false);
    }
  };

  const costoTotal = (parseFloat(form.cantidadUso) || 0) * (parseFloat(form.costoUnitarioUso) || 0);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {insumo ? 'Editar Insumo' : 'Agregar Insumo'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {loadingInsumos ? (
              <ActivityIndicator size="large" color="#166534" />
            ) : (
              <>
                {/* Insumo */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Insumo *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={form.insumoId}
                      onValueChange={handleInsumoChange}
                      style={styles.picker}
                      enabled={!insumo}
                    >
                      <Picker.Item label="Seleccionar insumo..." value={undefined} />
                      {insumos.map((ins) => (
                        <Picker.Item
                          key={ins.id}
                          label={`${ins.nombre} (${ins.cantidad} ${ins.unidad})`}
                          value={ins.id}
                        />
                      ))}
                    </Picker>
                  </View>
                  {selectedInsumo && (
                    <Text style={styles.stockInfo}>
                      Stock disponible: {selectedInsumo.cantidad} {selectedInsumo.unidad}
                    </Text>
                  )}
                </View>

                {/* Cantidad */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Cantidad a Usar * {selectedInsumo && `(${selectedInsumo.unidad})`}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={form.cantidadUso}
                    onChangeText={(text) => setForm({ ...form, cantidadUso: text })}
                    keyboardType="numeric"
                  />
                </View>

                {/* Costo Unitario */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Costo Unitario *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={form.costoUnitarioUso}
                    onChangeText={(text) => setForm({ ...form, costoUnitarioUso: text })}
                    keyboardType="numeric"
                  />
                </View>

                {/* Descripción */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Descripción (Opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Detalles adicionales..."
                    value={form.descripcion}
                    onChangeText={(text) => setForm({ ...form, descripcion: text })}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Costo Total */}
                {costoTotal > 0 && (
                  <View style={styles.costoContainer}>
                    <Text style={styles.costoLabel}>Costo Total:</Text>
                    <Text style={styles.costoValue}>
                      ${costoTotal.toLocaleString('es-CO')}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

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
              disabled={loading || loadingInsumos}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '85%',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
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
    minHeight: 80,
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
  stockInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  costoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  costoLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  costoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e40af',
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
});

export default InsumoModal;
