import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Sprout, Calendar, Hash } from 'lucide-react-native';
import { cropsAPI } from '../../../shared/services/api';
import { Cultivo, CreateCultivoDto } from '../../../shared/types';

interface CropFormProps {
  onClose: () => void;
  crop?: Cultivo;
}

const CropFormScreen: React.FC<CropFormProps> = ({ onClose, crop }) => {
  const [form, setForm] = useState({
    nombre: '',
    variedad: '',
    fechaSiembra: '',
    area: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crop) {
      setForm({
        nombre: crop.nombre,
        variedad: crop.variedad,
        fechaSiembra: crop.fechaSiembra.split('T')[0],
        area: crop.area.toString(),
      });
    }
  }, [crop]);

  const handleSave = async () => {
    if (!form.nombre || !form.variedad || !form.fechaSiembra || !form.area) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    try {
      const data: CreateCultivoDto = {
        nombre: form.nombre,
        variedad: form.variedad,
        fechaSiembra: form.fechaSiembra,
        area: Number(form.area),
        // loteId and subloteId would be selected here
      };

      if (crop) {
        await cropsAPI.update(crop.id, data);
        Alert.alert('Éxito', 'Cultivo actualizado correctamente');
      } else {
        await cropsAPI.create(data);
        Alert.alert('Éxito', 'Cultivo creado correctamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving crop:', error);
      Alert.alert('Error', 'No se pudo guardar el cultivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{crop ? 'Editar Cultivo' : 'Nuevo Cultivo'}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre del Cultivo</Text>
        <View style={styles.inputWrapper}>
          <Sprout size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: Maíz Híbrido"
            value={form.nombre}
            onChangeText={(text) => setForm({...form, nombre: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Variedad</Text>
        <View style={styles.inputWrapper}>
          <Sprout size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: DK-7088"
            value={form.variedad}
            onChangeText={(text) => setForm({...form, variedad: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha de Siembra</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={form.fechaSiembra}
            onChangeText={(text) => setForm({...form, fechaSiembra: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Área (Ha)</Text>
        <View style={styles.inputWrapper}>
          <Hash size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0.0"
            value={form.area}
            onChangeText={(text) => setForm({...form, area: text})}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={loading}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#166534',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#666',
  },
});

export default CropFormScreen;
