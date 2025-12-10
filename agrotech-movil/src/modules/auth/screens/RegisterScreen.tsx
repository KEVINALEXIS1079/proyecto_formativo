import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { RootStackParamList } from '../../../shared/navigation/AppNavigator';
import { useRegister } from '../hooks/useRegister';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [form, setForm] = useState({
    cedula_usuario: '',
    nombre_usuario: '',
    apellido_usuario: '',
    correo_usuario: '',
    telefono_usuario: '',
    id_ficha: '',
    contrasena_usuario: '',
    confirmar: '',
  });
  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');
  const [confirmarError, setConfirmarError] = useState('');

  const registerMutation = useRegister();

  useEffect(() => {
    if (registerMutation.data) {
      Alert.alert('Éxito', registerMutation.data.message || 'Registro completado', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  }, [registerMutation.data, navigation]);

  useEffect(() => {
    if (registerMutation.error) {
      const message = ((registerMutation.error as AxiosError)?.response?.data as { message?: string })?.message || registerMutation.error.message || 'Error al registrar usuario';
      Alert.alert('Error', message);
    }
  }, [registerMutation.error]);

  const validateNombre = (nombre: string) => {
    if (!nombre.trim()) return 'El nombre es obligatorio';
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(nombre)) return 'El nombre solo puede contener letras y espacios';
    return '';
  };

  const validateApellido = (apellido: string) => {
    if (!apellido.trim()) return 'El apellido es obligatorio';
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(apellido)) return 'El apellido solo puede contener letras y espacios';
    return '';
  };

  const validateCorreo = (correo: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo) return 'El correo electrónico es obligatorio';
    if (!emailRegex.test(correo)) return 'Ingresa un correo electrónico válido';
    return '';
  };

  const validateContrasena = (contrasena: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!contrasena) return 'La contraseña es obligatoria';
    if (!passwordRegex.test(contrasena)) return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    return '';
  };

  const validateConfirmar = (confirmar: string, contrasena: string) => {
    if (!confirmar) return 'La confirmación de contraseña es obligatoria';
    if (confirmar !== contrasena) return 'Las contraseñas no coinciden';
    return '';
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = () => {
    const nombreErr = validateNombre(form.nombre_usuario);
    const apellidoErr = validateApellido(form.apellido_usuario);
    const correoErr = validateCorreo(form.correo_usuario);
    const contrasenaErr = validateContrasena(form.contrasena_usuario);
    const confirmarErr = validateConfirmar(form.confirmar, form.contrasena_usuario);

    setNombreError(nombreErr);
    setApellidoError(apellidoErr);
    setCorreoError(correoErr);
    setContrasenaError(contrasenaErr);
    setConfirmarError(confirmarErr);

    if (nombreErr || apellidoErr || correoErr || contrasenaErr || confirmarErr) {
      return;
    }

    const registerData = {
      nombre: form.nombre_usuario,
      apellido: form.apellido_usuario,
      identificacion: form.cedula_usuario,
      idFicha: form.id_ficha || undefined,
      telefono: form.telefono_usuario || undefined,
      correo: form.correo_usuario,
      password: form.contrasena_usuario,
    };

    registerMutation.mutate(registerData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerImageContainer}>
        <Image 
          source={require('../../../assets/images/FondoLogin.jpeg')} 
          style={styles.headerImage} 
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />
        <Text style={styles.headerTitle}>Únete a AgroTech</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        
        <Input label="Número de documento" value={form.cedula_usuario} onChangeText={(v: string) => handleChange('cedula_usuario', v)} keyboardType="numeric" />
        <Input label="Nombre" value={form.nombre_usuario} onChangeText={(v: string) => { handleChange('nombre_usuario', v); setNombreError(''); }} error={nombreError} />
        <Input label="Apellido" value={form.apellido_usuario} onChangeText={(v: string) => { handleChange('apellido_usuario', v); setApellidoError(''); }} error={apellidoError} />
        <Input label="Correo electrónico" value={form.correo_usuario} onChangeText={(v: string) => { handleChange('correo_usuario', v); setCorreoError(''); }} keyboardType="email-address" error={correoError} />
        <Input label="Teléfono" value={form.telefono_usuario} onChangeText={(v: string) => handleChange('telefono_usuario', v)} keyboardType="phone-pad" />
        <Input label="ID Ficha" value={form.id_ficha} onChangeText={(v: string) => handleChange('id_ficha', v)} />
        <Input label="Contraseña" value={form.contrasena_usuario} onChangeText={(v: string) => { handleChange('contrasena_usuario', v); setContrasenaError(''); }} secureTextEntry error={contrasenaError} />
        <Input label="Confirmar contraseña" value={form.confirmar} onChangeText={(v: string) => { handleChange('confirmar', v); setConfirmarError(''); }} secureTextEntry error={confirmarError} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={registerMutation.isLoading}
        >
          <Text style={styles.buttonText}>{registerMutation.isLoading ? 'Registrando...' : 'Registrarse'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const Input: React.FC<InputProps> = ({ label, value, onChangeText, secureTextEntry, keyboardType, error }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerImageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
    marginBottom: -30,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
