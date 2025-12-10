import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Package, DollarSign, Hash, AlignLeft } from 'lucide-react-native';
import { inventoryAPI } from '../../../shared/services/api';
import { Insumo, CreateInsumoDto } from '../../../shared/types';

interface InventoryFormProps {
  onClose: () => void;
  item?: Insumo;
}

const InventoryFormScreen: React.FC<InventoryFormProps> = ({ onClose, item }) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    unidad: '',
    costoUnitario: '',
    categoriaId: '',
    almacenId: '',
    proveedorId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        cantidad: item.cantidad.toString(),
        unidad: item.unidad,
        costoUnitario: item.costoUnitario.toString(),
        categoriaId: item.categoriaId.toString(),
        almacenId: item.almacenId.toString(),
        proveedorId: item.proveedorId.toString(),
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!form.nombre || !form.cantidad || !form.costoUnitario) {
      Alert.alert('Error', 'Nombre, cantidad y costo son requeridos');
      return;
    }

    setLoading(true);
    try {
      const data: CreateInsumoDto = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        cantidad: Number(form.cantidad),
        unidad: form.unidad || 'Unidad',
        costoUnitario: Number(form.costoUnitario),
        categoriaId: Number(form.categoriaId) || 1, // Default or select
        almacenId: Number(form.almacenId) || 1,
        proveedorId: Number(form.proveedorId) || 1,
      };

      if (item) {
        await inventoryAPI.update(item.id, data);
        Alert.alert('Éxito', 'Ítem actualizado correctamente');
      } else {
        await inventoryAPI.create(data);
        Alert.alert('Éxito', 'Ítem creado correctamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'No se pudo guardar el ítem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item ? 'Editar Ítem' : 'Nuevo Ítem'}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputWrapper}>
          <Package size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: Fertilizante NPK"
            value={form.nombre}
            onChangeText={(text) => setForm({...form, nombre: text})}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Cantidad</Text>
          <View style={styles.inputWrapper}>
            <Hash size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0"
              value={form.cantidad}
              onChangeText={(text) => setForm({...form, cantidad: text})}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Costo Unit.</Text>
          <View style={styles.inputWrapper}>
            <DollarSign size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={form.costoUnitario}
              onChangeText={(text) => setForm({...form, costoUnitario: text})}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Unidad</Text>
        <View style={styles.inputWrapper}>
          <Package size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: kg, litros, sacos"
            value={form.unidad}
            onChangeText={(text) => setForm({...form, unidad: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción</Text>
        <View style={styles.inputWrapper}>
          <AlignLeft size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Detalles del ítem..."
            value={form.descripcion}
            onChangeText={(text) => setForm({...form, descripcion: text})}
            multiline
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default InventoryFormScreen;
