import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { RootStackParamList } from '../../../shared/navigation/AppNavigator';
import { useRequestPasswordReset } from '../hooks/useRecover';

type RecoverPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecoverPassword'>;

const RecoverPasswordScreen: React.FC = () => {
  const navigation = useNavigation<RecoverPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const recoverMutation = useRequestPasswordReset();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es obligatorio';
    if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido';
    return '';
  };

  const handleRecover = () => {
    const emailErr = validateEmail(email);
    setEmailError(emailErr);
    if (emailErr) {
      return;
    }

    recoverMutation.mutate({ correo: email }, {
      onSuccess: (data) => {
        setSuccessMessage(data.message || 'Correo enviado con éxito');
        setShowSuccess(true);

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate('VerifyCode', { email: email, type: 'reset' });
        }, 2000);
      },
      onError: (error) => {
        const message = ((error as AxiosError)?.response?.data as { message?: string })?.message || error.message || 'Error al enviar el correo de recuperación';
        Alert.alert('Error', message);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>¡Correo Enviado!</Text>
            <Text style={styles.modalText}>
              {successMessage}
            </Text>
            <Text style={styles.modalSubText}>
              Redirigiendo...
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
        <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.description}>
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRecover}
          disabled={recoverMutation.isLoading}
        >
          <Text style={styles.buttonText}>{recoverMutation.isLoading ? 'Enviando...' : 'Enviar correo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    width: '80%',
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
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  }
});

export default RecoverPasswordScreen;
