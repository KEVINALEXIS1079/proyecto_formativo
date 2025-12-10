import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Lock, AlignLeft, Box } from 'lucide-react-native';
import { permissionsAPI } from '../../../shared/services/api';
import { Permission, CreatePermissionDto, UpdatePermissionDto } from '../../../shared/types';

interface PermissionFormProps {
  onClose: () => void;
  permission?: Permission;
}

const PermissionFormScreen: React.FC<PermissionFormProps> = ({ onClose, permission }) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    modulo: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission) {
      setForm({
        nombre: permission.nombre,
        descripcion: permission.descripcion || '',
        modulo: permission.modulo,
      });
    }
  }, [permission]);

  const handleSave = async () => {
    if (!form.nombre || !form.modulo) {
      Alert.alert('Error', 'El nombre y el módulo son requeridos');
      return;
    }

    setLoading(true);
    try {
      if (permission) {
        const updateData: UpdatePermissionDto = {
          nombre: form.nombre,
          descripcion: form.descripcion,
          modulo: form.modulo,
        };
        await permissionsAPI.update(permission.id, updateData);
        Alert.alert('Éxito', 'Permiso actualizado correctamente');
      } else {
        const createData: CreatePermissionDto = {
          nombre: form.nombre,
          descripcion: form.descripcion,
          modulo: form.modulo,
        };
        await permissionsAPI.create(createData);
        Alert.alert('Éxito', 'Permiso creado correctamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving permission:', error);
      Alert.alert('Error', 'No se pudo guardar el permiso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{permission ? 'Editar Permiso' : 'Nuevo Permiso'}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre del Permiso</Text>
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: Crear Usuarios"
            value={form.nombre}
            onChangeText={(text) => setForm({...form, nombre: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Módulo</Text>
        <View style={styles.inputWrapper}>
          <Box size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej: Usuarios"
            value={form.modulo}
            onChangeText={(text) => setForm({...form, modulo: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción</Text>
        <View style={styles.inputWrapper}>
          <AlignLeft size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Descripción del permiso..."
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

export default PermissionFormScreen;
