import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme, Menu, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Upload, X, Bug, Leaf, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { epaAPI, tipoEpaAPI, tipoCultivoEpaAPI } from '../../../shared/services/api';

const CreateEpaScreen: React.FC = () => {
    const navigation = useNavigation();
    const theme = useTheme();

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Data lists
    const [tiposEpa, setTiposEpa] = useState<any[]>([]);
    const [tiposCultivoEpa, setTiposCultivoEpa] = useState<any[]>([]);

    // Form Fields
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipoEpa, setTipoEpa] = useState<any>(null); // Object or ID? Web sends string Enum probably, but backend might want ID or Enum. API service types map it.
    // Based on web service, it sends { tipoEpa: "enfermedad" } enum string. But wait, `tipoEpa` input in web form is the enum string.
    // In `epa.service.ts`: `if (!body.tipoEpa || body.tipoEpa === "")` suggests it expects a string.

    const [tipoCultivoEpaId, setTipoCultivoEpaId] = useState<number | null>(null);
    const [sintomas, setSintomas] = useState('');
    const [manejoYControl, setManejoYControl] = useState('');
    const [imagenes, setImagenes] = useState<any[]>([]);

    // UI States
    const [showTipoEpaMenu, setShowTipoEpaMenu] = useState(false);
    const [showTipoCultivoMenu, setShowTipoCultivoMenu] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            setLoadingData(true);
            const [tiposEpaRes, tiposCultivoRes] = await Promise.all([
                tipoEpaAPI.list(),
                tipoCultivoEpaAPI.list()
            ]);

            const epaData = Array.isArray(tiposEpaRes.data) ? tiposEpaRes.data : (tiposEpaRes.data?.data || []);
            const cultivoData = Array.isArray(tiposCultivoRes.data) ? tiposCultivoRes.data : (tiposCultivoRes.data?.data || []);

            setTiposEpa(epaData);
            setTiposCultivoEpa(cultivoData);
        } catch (error) {
            console.error('Error loading form data', error);
            Alert.alert('Error', 'No se pudieron cargar los datos necesarios');
        } finally {
            setLoadingData(false);
        }
    };

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesitan permisos para acceder a la galería');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImagenes([...imagenes, ...result.assets]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...imagenes];
        newImages.splice(index, 1);
        setImagenes(newImages);
    };

    const validate = () => {
        const newErrors: any = {};
        if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        if (!tipoEpa) newErrors.tipoEpa = 'Seleccione un tipo';
        if (!tipoCultivoEpaId) newErrors.tipoCultivoEpaId = 'Seleccione un cultivo afectado';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            // Prepare payload
            // Web input: tipoEpa is string enum. tipoCultivoEpaId is number.
            // We need to map the selected tipoEpa object to its enum or ID.
            // If `tiposEpa` list contains objects with `tipoEpaEnum`, utilize that.
            // Fallback: use nombre lowercase if no enum field key found.

            const tipoEpaEnum = tipoEpa?.tipoEpaEnum || tipoEpa?.nombre?.toLowerCase() || 'enfermedad';

            const payload = {
                nombre,
                descripcion,
                estado: 'presente',
                tipoEpa: tipoEpaEnum,
                tipoCultivoEpaId: Number(tipoCultivoEpaId),
                sintomas,
                manejoYControl,
                fotosGenerales: imagenes, // API service handles array of image objects
            };

            console.log('Sending EPA payload:', payload);
            await epaAPI.create(payload);

            Alert.alert('Éxito', 'EPA registrado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            console.error('Error creating EPA:', error);
            const msg = error.response?.data?.message || error.message || 'Error desconocido';
            Alert.alert('Error', `No se pudo registrar: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#166534" />
                <Text style={{ marginTop: 10, color: '#166534' }}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text variant="headlineSmall" style={styles.title}>Crear EPA</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Basic Info */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        <Bug size={18} color="#dc2626" /> Información Básica
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nombre *</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Ej. Roya del café"
                            value={nombre}
                            onChangeText={setNombre}
                            error={!!errors.nombre}
                            style={styles.input}
                        />
                        {errors.nombre && <HelperText type="error">{errors.nombre}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tipo de Problema *</Text>
                        <Menu
                            visible={showTipoEpaMenu}
                            onDismiss={() => setShowTipoEpaMenu(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setShowTipoEpaMenu(true)} style={styles.selector}>
                                    <Text style={{ color: tipoEpa ? '#000' : '#666', textTransform: 'capitalize' }}>
                                        {tipoEpa?.nombre || 'Seleccionar Tipo'}
                                    </Text>
                                </TouchableOpacity>
                            }
                        >
                            {tiposEpa.map((t) => (
                                <Menu.Item
                                    key={t.id}
                                    onPress={() => { setTipoEpa(t); setShowTipoEpaMenu(false); }}
                                    title={t.nombre}
                                />
                            ))}
                        </Menu>
                        {errors.tipoEpa && <HelperText type="error">{errors.tipoEpa}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Cultivo Afectado *</Text>
                        <Menu
                            visible={showTipoCultivoMenu}
                            onDismiss={() => setShowTipoCultivoMenu(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setShowTipoCultivoMenu(true)} style={styles.selector}>
                                    <Text style={{ color: tipoCultivoEpaId ? '#000' : '#666' }}>
                                        {tiposCultivoEpa.find(c => c.id === tipoCultivoEpaId)?.nombre || 'Seleccionar Cultivo'}
                                    </Text>
                                </TouchableOpacity>
                            }
                        >
                            {tiposCultivoEpa.map((c) => (
                                <Menu.Item
                                    key={c.id}
                                    onPress={() => { setTipoCultivoEpaId(c.id); setShowTipoCultivoMenu(false); }}
                                    title={c.nombre}
                                />
                            ))}
                        </Menu>
                        {errors.tipoCultivoEpaId && <HelperText type="error">{errors.tipoCultivoEpaId}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descripción *</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Descripción general..."
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                            numberOfLines={3}
                            error={!!errors.descripcion}
                            style={styles.input}
                        />
                        {errors.descripcion && <HelperText type="error">{errors.descripcion}</HelperText>}
                    </View>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        <Leaf size={18} color="#166534" /> Detalles Técnicos
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Síntomas</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Signos visibles en la planta..."
                            value={sintomas}
                            onChangeText={setSintomas}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Manejo y Control</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Tratamientos recomendados..."
                            value={manejoYControl}
                            onChangeText={setManejoYControl}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Images */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        <Upload size={18} color="#2563eb" /> Evidencia Fotográfica
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                            <Upload size={24} color="#666" />
                            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Agregar</Text>
                        </TouchableOpacity>

                        {imagenes.map((img, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <X size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                    buttonColor="#166534"
                    icon={() => <Save size={20} color="white" />}
                >
                    Guardar EPA
                </Button>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    title: {
        fontWeight: 'bold',
        color: '#1f2937',
        fontSize: 20,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 1,
    },
    sectionTitle: {
        marginBottom: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        fontSize: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
        color: '#374151',
        fontSize: 14,
    },
    input: {
        backgroundColor: '#fff',
        fontSize: 15,
    },
    selector: {
        borderWidth: 1,
        borderColor: '#79747e',
        borderRadius: 4,
        padding: 16,
        backgroundColor: '#fff',
    },
    saveButton: {
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 8,
        paddingVertical: 6,
    },
    imagesContainer: {
        flexDirection: 'row',
    },
    uploadButton: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    imageWrapper: {
        width: 80,
        height: 80,
        marginRight: 10,
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CreateEpaScreen;
