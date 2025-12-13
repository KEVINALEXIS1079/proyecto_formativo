import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { Checkbox } from 'react-native-paper';
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [cedulaError, setCedulaError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [idFichaError, setIdFichaError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');
  const [confirmarError, setConfirmarError] = useState('');

  const registerMutation = useRegister();

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

  const validateCedula = (cedula: string) => {
    if (!cedula) return 'El número de documento es obligatorio';
    if (!/^\d{10}$/.test(cedula)) return 'Debe tener exactamente 10 dígitos numéricos';
    return '';
  };

  const validateTelefono = (telefono: string) => {
    if (!telefono) return 'El teléfono es obligatorio';
    if (!/^\d{10}$/.test(telefono)) return 'Debe tener exactamente 10 dígitos numéricos';
    return '';
  };

  const validateIdFicha = (ficha: string) => {
    if (!ficha) return 'El ID de ficha es obligatorio';
    if (!/^\d{6,8}$/.test(ficha)) return 'Debe tener entre 6 y 8 dígitos numéricos';
    return '';
  };

  const validateCorreo = (correo: string) => {
    if (!correo) return 'El correo electrónico es obligatorio';
    if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(correo)) return 'Debe ser un correo @gmail.com válido';
    return '';
  };

  const validateContrasena = (contrasena: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!contrasena) return 'La contraseña es obligatoria';
    if (!passwordRegex.test(contrasena)) return 'Mín. 8 caracteres, mayúscula, minúscula y número';
    return '';
  };

  const validateConfirmar = (confirmar: string, contrasena: string) => {
    if (!confirmar) return 'La confirmación de contraseña es obligatoria';
    if (confirmar !== contrasena) return 'Las contraseñas no coinciden';
    return '';
  };

  const handleChange = (key: string, value: string) => {
    let finalValue = value;

    // Numeric enforcement
    if (['cedula_usuario', 'telefono_usuario', 'id_ficha'].includes(key)) {
      if (value && !/^\d*$/.test(value)) return; // Reject non-numeric
      finalValue = value;
    }

    // Email handling
    if (key === 'correo_usuario') {
      finalValue = value.toLowerCase();
    }

    setForm(prev => ({ ...prev, [key]: finalValue }));
  };

  const handleRegister = () => {
    console.log('DEBUG: handleRegister llamado');
    console.log('DEBUG: Form data:', JSON.stringify(form, null, 2));

    // Validar campos obligatorios
    if (!form.cedula_usuario || !form.nombre_usuario || !form.apellido_usuario || !form.correo_usuario || !form.telefono_usuario || !form.id_ficha || !form.contrasena_usuario || !form.confirmar) {
      console.log('DEBUG: Campos obligatorios faltantes');
      Alert.alert('Error', 'Todos los campos obligatorios (*) deben ser completados');
      return;
    }

    if (!termsAccepted) {
      console.log('DEBUG: Términos no aceptados');
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    console.log('DEBUG: Validando campos...');
    const nombreErr = validateNombre(form.nombre_usuario);
    const apellidoErr = validateApellido(form.apellido_usuario);
    const cedulaErr = validateCedula(form.cedula_usuario);
    const telefonoErr = validateTelefono(form.telefono_usuario);
    const idFichaErr = validateIdFicha(form.id_ficha);
    const correoErr = validateCorreo(form.correo_usuario);
    const contrasenaErr = validateContrasena(form.contrasena_usuario);
    const confirmarErr = validateConfirmar(form.confirmar, form.contrasena_usuario);

    console.log('DEBUG: Errores de validación:', { nombreErr, apellidoErr, cedulaErr, telefonoErr, idFichaErr, correoErr, contrasenaErr, confirmarErr });

    setNombreError(nombreErr);
    setApellidoError(apellidoErr);
    setCedulaError(cedulaErr);
    setTelefonoError(telefonoErr);
    setIdFichaError(idFichaErr);
    setCorreoError(correoErr);
    setContrasenaError(contrasenaErr);
    setConfirmarError(confirmarErr);

    if (nombreErr || apellidoErr || cedulaErr || telefonoErr || idFichaErr || correoErr || contrasenaErr || confirmarErr) {
      console.log('DEBUG: Validación fallida, deteniendo registro');
      return;
    }

    const registerData = {
      nombre: form.nombre_usuario.trim(),
      apellido: form.apellido_usuario.trim(),
      identificacion: form.cedula_usuario.trim(),
      idFicha: form.id_ficha.trim(),
      telefono: form.telefono_usuario.trim(),
      correo: form.correo_usuario.trim().toLowerCase(),
      password: form.contrasena_usuario,
    };

    console.log('DEBUG: Datos a enviar yyy:', JSON.stringify(registerData, null, 2));
    console.log('DEBUG: Llamando mutate...');

    registerMutation.mutate(registerData, {
      onSuccess: (data) => {
        console.log('DEBUG: onSuccess callback ejecutado');
        console.log('DEBUG: Datos de respuesta:', data);

        // Mostrar modal de éxito
        setShowSuccess(true);

        // Navegar automáticamente después de 2 segundos (imitando la web)
        setTimeout(() => {
          setShowSuccess(false);
          console.log('DEBUG: Navegando a VerifyCode con email:', form.correo_usuario);
          navigation.navigate('VerifyCode', { email: form.correo_usuario, type: 'registration' });
        }, 2000);
      },
      onError: (error) => {
        console.log('DEBUG: onError callback ejecutado');
        console.log('DEBUG: Error completo:', error);

        const axiosError = error as AxiosError;
        let message = 'Error al registrar usuario';

        if (axiosError.response?.data) {
          const data = axiosError.response.data as any;
          if (data.message) {
            if (Array.isArray(data.message)) {
              message = data.message.join('\n');
            } else {
              message = data.message;
            }
          }
        } else if (axiosError.message) {
          message = axiosError.message;
        }

        console.log('DEBUG: Mensaje de error final:', message);
        Alert.alert('Error', message);
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }} // Bloquear cierre manual
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Registro Iniciado</Text>
            <Text style={styles.modalText}>
              Hemos enviado un código a tu correo para verificar tu cuenta.
            </Text>
          </View>
        </View>
      </Modal>

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

        <Input label="Número de documento *" value={form.cedula_usuario} onChangeText={(v: string) => { handleChange('cedula_usuario', v); setCedulaError(''); }} keyboardType="numeric" error={cedulaError} />
        <Input label="Nombre *" value={form.nombre_usuario} onChangeText={(v: string) => { handleChange('nombre_usuario', v); setNombreError(''); }} error={nombreError} />
        <Input label="Apellido *" value={form.apellido_usuario} onChangeText={(v: string) => { handleChange('apellido_usuario', v); setApellidoError(''); }} error={apellidoError} />
        <Input label="Correo electrónico *" value={form.correo_usuario} onChangeText={(v: string) => { handleChange('correo_usuario', v); setCorreoError(''); }} keyboardType="email-address" error={correoError} />
        <Input label="Teléfono *" value={form.telefono_usuario} onChangeText={(v: string) => { handleChange('telefono_usuario', v); setTelefonoError(''); }} keyboardType="phone-pad" error={telefonoError} />
        <Input label="ID Ficha *" value={form.id_ficha} onChangeText={(v: string) => { handleChange('id_ficha', v); setIdFichaError(''); }} error={idFichaError} keyboardType="numeric" />
        <Input label="Contraseña *" value={form.contrasena_usuario} onChangeText={(v: string) => { handleChange('contrasena_usuario', v); setContrasenaError(''); }} secureTextEntry error={contrasenaError} />
        <Input label="Confirmar contraseña *" value={form.confirmar} onChangeText={(v: string) => { handleChange('confirmar', v); setConfirmarError(''); }} secureTextEntry error={confirmarError} />

        <View style={styles.checkboxContainer}>
          <Checkbox.Android
            status={termsAccepted ? 'checked' : 'unchecked'}
            onPress={() => setTermsAccepted(!termsAccepted)}
            color="#2E7D32"
            uncheckedColor="#666"
          />
          <Text style={styles.checkboxLabel} onPress={() => setTermsAccepted(!termsAccepted)}>
            Acepto los términos y condiciones
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, registerMutation.isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={registerMutation.isLoading}
        >
          <Text style={styles.buttonText}>
            {registerMutation.isLoading ? 'Registrando...' : 'Registrarse'}
          </Text>
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
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
      placeholder={label}
      placeholderTextColor="#999"
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
    margin: 20,
    marginTop: -30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
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
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 30,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});


export default RegisterScreen;