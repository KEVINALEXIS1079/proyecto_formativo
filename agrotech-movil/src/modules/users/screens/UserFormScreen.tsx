import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { User, Mail, Shield, Phone } from 'lucide-react-native';
import { usersAPI, rolesAPI } from '../../../shared/services/api';
import { User as UserType, Role, CreateUserDto, UpdateUserDto } from '../../../shared/types';

interface UserFormProps {
  onClose: () => void;
  user?: UserType;
}

const UserFormScreen: React.FC<UserFormProps> = ({ onClose, user }) => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rolId: 0,
    telefono: '',
    password: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
    if (user) {
      setForm({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rolId: user.rol?.id || 0,
        telefono: user.telefono || '',
        password: '', // No mostrar password existente
      });
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSave = async () => {
    if (!form.nombre || !form.apellido || !form.email || !form.rolId) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        const updateData: UpdateUserDto = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          rolId: form.rolId,
          telefono: form.telefono,
        };
        await usersAPI.update(user.id, updateData);
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        if (!form.password) {
          Alert.alert('Error', 'La contraseña es requerida para nuevos usuarios');
          setLoading(false);
          return;
        }
        const createData: CreateUserDto = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          rolId: form.rolId,
          telefono: form.telefono,
        };
        await usersAPI.create(createData);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'No se pudo guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</Text>
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan"
              value={form.nombre}
              onChangeText={(text) => setForm({...form, nombre: text})}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellido</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Pérez"
              value={form.apellido}
              onChangeText={(text) => setForm({...form, apellido: text})}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@agrotech.com"
              value={form.email}
              onChangeText={(text) => setForm({...form, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rol</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.rolId}
              onValueChange={(value) => setForm({...form, rolId: value})}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar rol..." value={0} />
              {roles.map((role) => (
                <Picker.Item
                  key={role.id}
                  label={role.nombre}
                  value={role.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+57 300 123 4567"
              value={form.telefono}
              onChangeText={(text) => setForm({...form, telefono: text})}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {!user && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Shield size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChangeText={(text) => setForm({...form, password: text})}
                secureTextEntry
              />
            </View>
          </View>
        )}
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
    maxHeight: '85%',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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

export default UserFormScreen;
