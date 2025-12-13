import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Platform,
    Modal,
    Animated
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { completeRegister, verifyEmail } from '../api/auth.service';
import { RootStackParamList } from '../../../shared/navigation/AppNavigator';

type VerifyCodeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VerifyCode'>;
type VerifyCodeScreenRouteProp = RouteProp<RootStackParamList, 'VerifyCode'>;

const VerifyCodeScreen: React.FC = () => {
    const navigation = useNavigation<VerifyCodeScreenNavigationProp>();
    const route = useRoute<VerifyCodeScreenRouteProp>();
    const email = route.params?.email || '';
    const type = route.params?.type || 'verify'; // 'verify' or 'registration'

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
    const [snackbarFadeAnim] = useState(new Animated.Value(0));

    const showSnackbar = (message: string, type: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);

        Animated.timing(snackbarFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Auto-hide after 4 seconds for errors, 2 seconds for success
        setTimeout(() => {
            hideSnackbar();
        }, type === 'error' ? 4000 : 2000);
    };

    const hideSnackbar = () => {
        Animated.timing(snackbarFadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setSnackbarVisible(false);
        });
    };

    const handleVerify = async () => {
        if (!code || code.length < 6) {
            showSnackbar('Por favor ingresa el código completo de 6 dígitos.', 'error');
            return;
        }

        setLoading(true);
        try {
            let response: any;
            if (type === 'registration') {
                response = await completeRegister({ correo: email, code });
                if (!response.success) {
                    throw { response: { data: response } };
                }
            } else if (type === 'reset') {
                // Use verifyEmail to validate code, or if specific endpoint needed (verify-reset-code)
                // Assuming verifyEmail works for validation or using similar logic
                response = await verifyEmail({ correo: email, code });
                // Note: Ideally call verifyResetCode if exists, but verifyEmail validates code ownership
                if (!response.success) {
                    throw { response: { data: response } };
                }
                setSuccessMessage('Código verificado correctamente.');
                showSnackbar('Código correcto. Revisa tu correo para la nueva contraseña.', 'success');
            } else {
                // Default to 'verify' type
                response = await verifyEmail({ correo: email, code });
                if (!response.success) {
                    throw { response: { data: response } };
                }
                setSuccessMessage('Cuenta verificada correctamente');
                showSnackbar('Cuenta verificada correctamente', 'success');
            }

            setShowSuccess(true);

            // Navigate to appropriate screen after showing success
            setTimeout(() => {
                setShowSuccess(false);
                if (type === 'reset') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ResetPassword', params: { email, code } }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            }, 2000);

        } catch (error: any) {
            console.error('Error verifying code:', error);

            // Default message
            let message = 'Código inválido o expirado';

            if (error?.response) {
                const data = error.response.data;
                const status = error.response.status;

                if (status === 400 || status === 401) {
                    message = 'Código de verificación incorrecto';
                } else if (data && data.message) {
                    message = data.message;
                }

                if (data && data.success === false && data.message) {
                    message = data.message;
                    if (message.includes('Código inválido')) {
                        message = 'Código de verificación incorrecto';
                    }
                }
            } else {
                message = 'Código de verificación incorrecto';
            }

            showSnackbar(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Modal de éxito */}
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
                        <Text style={styles.modalTitle}>¡Éxito!</Text>
                        <Text style={styles.modalText}>
                            {successMessage}
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Botón de volver */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>

            {/* Header con imagen */}
            <View style={styles.headerImageContainer}>
                <Image
                    source={require('../../../assets/images/FondoLogin.jpeg')}
                    style={styles.headerImage}
                    resizeMode="cover"
                />
                <View style={styles.headerOverlay} />
                <Text style={styles.headerTitle}>Verificación</Text>
            </View>

            {/* Tarjeta del formulario */}
            <View style={styles.card}>
                <Text style={styles.title}>Ingresa el código</Text>
                <Text style={styles.subtitle}>
                    Hemos enviado un código de verificación a: {email}
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Código de Verificación</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="123456"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Verificar Cuenta'}</Text>
                </TouchableOpacity>
            </View>

            {/* Snackbar/Toast Notification */}
            {snackbarVisible && (
                <Animated.View
                    style={[
                        styles.snackbar,
                        snackbarType === 'success' ? styles.snackbarSuccess : styles.snackbarError,
                        {
                            opacity: snackbarFadeAnim,
                            transform: [{
                                translateY: snackbarFadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <View style={styles.snackbarContent}>
                        <Text style={[
                            styles.snackbarText,
                            snackbarType === 'success' ? styles.snackbarTextSuccess : styles.snackbarTextError
                        ]}>
                            {snackbarMessage}
                        </Text>
                        <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarClose}>
                            <Text style={styles.snackbarCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
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
                elevation: 4,
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
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
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
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#fafafa',
        letterSpacing: 4,
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
    // Snackbar styles
    snackbar: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    snackbarSuccess: {
        backgroundColor: '#d1fae5',
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    snackbarError: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    snackbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    snackbarText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        paddingRight: 8,
    },
    snackbarTextSuccess: {
        color: '#065f46',
    },
    snackbarTextError: {
        color: '#7f1d1d',
    },
    snackbarClose: {
        padding: 4,
    },
    snackbarCloseText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
});

export default VerifyCodeScreen;