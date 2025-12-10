import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MapPin, Ruler, Layers } from 'lucide-react-native';
import { geoAPI } from '../../../shared/services/api';
import { CreateLoteDto, CreateSubLoteDto } from '../../../shared/types';

interface GeoFormProps {
   onClose: () => void;
   activeTab?: 'lotes' | 'sublotes';
   selectedLote?: any;
   selectedSublote?: any;
}

const GeoForm: React.FC<GeoFormProps> = ({ onClose, activeTab = 'lotes', selectedLote, selectedSublote }) => {
   const isLote = activeTab === 'lotes';
   const selectedItem = isLote ? selectedLote : selectedSublote;

   const [form, setForm] = useState({
     name: selectedItem?.nombre || '',
     description: isLote ? (selectedItem?.descripcion || '') : '',
     area: selectedItem?.area?.toString() || '',
     loteId: isLote ? '' : (selectedItem?.loteId?.toString() || ''),
   });
   const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.area) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (Nombre y Área)');
      return;
    }

    if (!isLote && !form.loteId) {
      Alert.alert('Error', 'Por favor selecciona un lote para el sublote');
      return;
    }

    setLoading(true);
    try {
      if (selectedItem) {
        // Editar
        if (isLote) {
          await geoAPI.updateLote(selectedItem.id, {
            nombre: form.name,
            descripcion: form.description,
            area: parseFloat(form.area),
          });
        } else {
          // Para sublotes, asumimos que hay un endpoint updateSubLote, pero no está en la API actual
          // Por ahora, solo crearemos uno nuevo si no existe
          Alert.alert('Info', 'Edición de sublotes no implementada aún');
          onClose();
          return;
        }
        Alert.alert('Éxito', `${isLote ? 'Lote' : 'Sublote'} actualizado correctamente`);
      } else {
        // Crear
        if (isLote) {
          const createData: CreateLoteDto = {
            nombre: form.name,
            descripcion: form.description,
            area: parseFloat(form.area),
          };
          await geoAPI.createLote(createData);
        } else {
          const createData: CreateSubLoteDto = {
            nombre: form.name,
            area: parseFloat(form.area),
            loteId: parseInt(form.loteId),
          };
          await geoAPI.createSubLote(createData);
        }
        Alert.alert('Éxito', `${isLote ? 'Lote' : 'Sublote'} creado correctamente`);
      }
      onClose();
    } catch (error) {
      console.error(`Error saving ${isLote ? 'lote' : 'sublote'}:`, error);
      Alert.alert('Error', `No se pudo guardar el ${isLote ? 'lote' : 'sublote'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {selectedItem ? `Editar ${isLote ? 'Lote' : 'Sublote'}` : `Nuevo ${isLote ? 'Lote' : 'Sublote'}`}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre del {isLote ? 'Lote' : 'Sublote'}</Text>
        <View style={styles.inputWrapper}>
          <MapPin size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={`Ej: ${isLote ? 'Lote Norte' : 'Sublote A'}`}
            value={form.name}
            onChangeText={(text) => setForm({...form, name: text})}
          />
        </View>
      </View>

      {isLote && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción</Text>
          <View style={styles.inputWrapper}>
            <Layers size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Descripción del terreno..."
              value={form.description}
              onChangeText={(text) => setForm({...form, description: text})}
            />
          </View>
        </View>
      )}

      {!isLote && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Lote Padre</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ID del lote padre"
              value={form.loteId}
              onChangeText={(text) => setForm({...form, loteId: text})}
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Área (Hectáreas)</Text>
        <View style={styles.inputWrapper}>
          <Ruler size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: 5.0"
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

export default GeoForm;
