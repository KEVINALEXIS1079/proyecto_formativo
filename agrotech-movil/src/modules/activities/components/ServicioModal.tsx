import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Platform
} from 'react-native';
import { X } from 'lucide-react-native';
import { ActivityServicio, CreateActivityServicioDto } from '../types';

interface ServicioModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateActivityServicioDto) => Promise<void>;
  servicio?: ActivityServicio;
}

const ServicioModal: React.FC<ServicioModalProps> = ({
  visible,
  onClose,
  onSave,
  servicio
}) => {
  const [form, setForm] = useState({
    nombreServicio: '',
    horas: '',
    precioHora: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (servicio) {
        setForm({
          nombreServicio: servicio.nombreServicio,
          horas: servicio.horas.toString(),
          precioHora: servicio.precioHora.toString(),
        });
      } else {
        setForm({
          nombreServicio: '',
          horas: '',
          precioHora: '',
        });
      }
    }
  }, [visible, servicio]);

  const handleSave = async () => {
    if (!form.nombreServicio.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del servicio');
      return;
    }

    const horas = parseFloat(form.horas) || 0;
    const precioHora = parseFloat(form.precioHora) || 0;

    if (horas <= 0 || precioHora <= 0) {
      Alert.alert('Error', 'Las horas y el precio deben ser mayores a 0');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        nombreServicio: form.nombreServicio.trim(),
        horas,
        precioHora,
      });
      onClose();
    } catch (error) {
      console.error('Error saving servicio:', error);
      Alert.alert('Error', 'No se pudo guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const costoCalculado = (parseFloat(form.horas) || 0) * (parseFloat(form.precioHora) || 0);

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
              {servicio ? 'Editar Servicio' : 'Agregar Servicio'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Nombre del Servicio */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del Servicio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Fumigación aérea, Transporte, etc."
                value={form.nombreServicio}
                onChangeText={(text) => setForm({ ...form, nombreServicio: text })}
              />
            </View>

            {/* Horas */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Horas del Servicio *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.horas}
                onChangeText={(text) => setForm({ ...form, horas: text })}
                keyboardType="numeric"
              />
            </View>

            {/* Precio por Hora */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Precio por Hora *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.precioHora}
                onChangeText={(text) => setForm({ ...form, precioHora: text })}
                keyboardType="numeric"
              />
            </View>

            {/* Costo Calculado */}
            {costoCalculado > 0 && (
              <View style={styles.costoContainer}>
                <Text style={styles.costoLabel}>Costo Total:</Text>
                <Text style={styles.costoValue}>
                  ${costoCalculado.toLocaleString('es-CO')}
                </Text>
              </View>
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
              disabled={loading}
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
  costoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  costoLabel: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  costoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400e',
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

export default ServicioModal;
