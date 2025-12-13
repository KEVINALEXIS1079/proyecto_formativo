import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, Platform, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../shared/navigation/AppNavigator';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
    const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
    const route = useRoute<ResetPasswordScreenRouteProp>();
    // Assume we passed email and code from VerifyCodeScreen or similar
    const email = route.params?.email || '';
    const code = route.params?.code || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Placeholder for reset password API call
    // In a real app, you would import a service function here
    const resetPasswordApi = async (data: any) => {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(resolve, 1500));
    };

    const validatePassword = (pass: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pass) return 'La contraseña es obligatoria';
        if (!passwordRegex.test(pass)) return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
        return '';
    };

    const handleResetPassword = async () => {
        const passErr = validatePassword(password);
        if (passErr) {
            setPasswordError(passErr);
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }
        setPasswordError('');

        setLoading(true);
        try {
            await resetPasswordApi({ correo: email, code, newPassword: password });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }, 2000);
        } catch (error) {
            console.error(error);
            setPasswordError('Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.modalTitle}>¡Contraseña Restablecida!</Text>
                        <Text style={styles.modalText}>
                            Tu contraseña ha sido actualizada correctamente.
                        </Text>
                        <Text style={styles.modalSubText}>
                            Volviendo al inicio de sesión...
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
                <Text style={styles.headerTitle}>Nueva Contraseña</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.description}>
                    Crea una nueva contraseña segura para tu cuenta.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nueva Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        secureTextEntry
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmar Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        secureTextEntry
                    />
                    {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Actualizando...' : 'Restablecer Contraseña'}</Text>
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

export default ResetPasswordScreen;
