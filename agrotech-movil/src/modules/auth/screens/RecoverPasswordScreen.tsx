import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
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

  const recoverMutation = useRequestPasswordReset();

  useEffect(() => {
    if (recoverMutation.data) {
      Alert.alert('Correo enviado', recoverMutation.data.message || 'Revisa tu bandeja de entrada para restablecer tu contraseña', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  }, [recoverMutation.data, navigation]);

  useEffect(() => {
    if (recoverMutation.error) {
      const message = ((recoverMutation.error as AxiosError)?.response?.data as { message?: string })?.message || recoverMutation.error.message || 'Error al enviar el correo de recuperación';
      Alert.alert('Error', message);
    }
  }, [recoverMutation.error]);

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

    recoverMutation.mutate({ correo: email });
  };

  return (
    <View style={styles.container}>
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
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
});

export default RecoverPasswordScreen;
