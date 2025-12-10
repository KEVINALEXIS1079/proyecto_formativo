import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Shield, AlignLeft } from 'lucide-react-native';
import { rolesAPI, permissionsAPI } from '../../../shared/services/api';
import { Role, Permission, CreateRoleDto, UpdateRoleDto } from '../../../shared/types';

interface RoleFormProps {
  onClose: () => void;
  role?: Role;
}

const RoleFormScreen: React.FC<RoleFormProps> = ({ onClose, role }) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    permisosIds: [] as number[],
  });
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    fetchPermissions();
    if (role) {
      setForm({
        nombre: role.nombre,
        descripcion: role.descripcion || '',
        permisosIds: role.permisos?.map(p => p.id) || [],
      });
    }
  }, [role]);

  const fetchPermissions = async () => {
    try {
      const response = await permissionsAPI.getAll();
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleSave = async () => {
    if (!form.nombre) {
      Alert.alert('Error', 'El nombre del rol es requerido');
      return;
    }

    setLoading(true);
    try {
      if (role) {
        const updateData: UpdateRoleDto = {
          nombre: form.nombre,
          descripcion: form.descripcion,
          permisosIds: form.permisosIds,
        };
        await rolesAPI.update(role.id, updateData);
        Alert.alert('Éxito', 'Rol actualizado correctamente');
      } else {
        const createData: CreateRoleDto = {
          nombre: form.nombre,
          descripcion: form.descripcion,
          permisosIds: form.permisosIds,
        };
        await rolesAPI.create(createData);
        Alert.alert('Éxito', 'Rol creado correctamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      Alert.alert('Error', 'No se pudo guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: number) => {
    setForm(prev => {
      const exists = prev.permisosIds.includes(id);
      if (exists) {
        return { ...prev, permisosIds: prev.permisosIds.filter(pId => pId !== id) };
      } else {
        return { ...prev, permisosIds: [...prev.permisosIds, id] };
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{role ? 'Editar Rol' : 'Nuevo Rol'}</Text>
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre del Rol</Text>
          <View style={styles.inputWrapper}>
            <Shield size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Administrador"
              value={form.nombre}
              onChangeText={(text) => setForm({...form, nombre: text})}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción</Text>
          <View style={styles.inputWrapper}>
            <AlignLeft size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Descripción del rol..."
              value={form.descripcion}
              onChangeText={(text) => setForm({...form, descripcion: text})}
              multiline
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Permisos</Text>
          <View style={styles.permissionsList}>
            {permissions.map(perm => (
              <TouchableOpacity
                key={perm.id}
                style={[
                  styles.permissionItem,
                  form.permisosIds.includes(perm.id) && styles.permissionItemSelected
                ]}
                onPress={() => togglePermission(perm.id)}
              >
                <Text style={[
                  styles.permissionText,
                  form.permisosIds.includes(perm.id) && styles.permissionTextSelected
                ]}>
                  {perm.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

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
    maxHeight: '80%',
  },
  scrollContent: {
    maxHeight: 400,
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
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  permissionItemSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#166534',
  },
  permissionText: {
    fontSize: 12,
    color: '#666',
  },
  permissionTextSelected: {
    color: '#166534',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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

export default RoleFormScreen;
