import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cropsAPI, geoAPI, API_URL } from '../../../shared/services/api';
import { Lote, SubLote } from '../../../shared/types';
import { ArrowLeft, Calendar, Save, Sprout, MapPin, Clock, X, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const CreateCropScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const theme = useTheme();

    // Check if we are in edit mode
    const editingCrop = route.params?.crop;
    const isEditMode = !!editingCrop;

    const [loading, setLoading] = useState(false);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [sublotes, setSublotes] = useState<SubLote[]>([]);

    // Form Fields
    const [nombreCultivo, setNombreCultivo] = useState(editingCrop?.nombre || editingCrop?.nombreCultivo || '');
    const [tipoCultivo, setTipoCultivo] = useState(
        typeof editingCrop?.tipoCultivo === 'object'
            ? editingCrop?.tipoCultivo?.nombre
            : (editingCrop?.tipoCultivo || '')
    );
    const [descripcion, setDescripcion] = useState(editingCrop?.descripcion || editingCrop?.variedad || '');
    const [estado, setEstado] = useState(editingCrop?.estado || 'activo');
    const [motivo, setMotivo] = useState(editingCrop?.motivo || '');

    // Image handling
    const [image, setImage] = useState<any>(
        editingCrop?.imgCultivo || editingCrop?.imagen
            ? (editingCrop.imgCultivo || editingCrop.imagen).startsWith('http')
                ? (editingCrop.imgCultivo || editingCrop.imagen)
                : `${API_URL}/${editingCrop.imgCultivo || editingCrop.imagen}`
            : null
    );
    const [imageFile, setImageFile] = useState<any>(null);

    // Dates
    const [fechaInicio, setFechaInicio] = useState(
        editingCrop?.fechaInicio
            ? new Date(editingCrop.fechaInicio).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [fechaSiembra, setFechaSiembra] = useState(
        editingCrop?.fechaSiembra
            ? new Date(editingCrop.fechaSiembra).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [fechaFinalizacion, setFechaFinalizacion] = useState(
        editingCrop?.fechaFinalizacion
            ? new Date(editingCrop.fechaFinalizacion).toISOString().split('T')[0]
            : ''
    );

    // Location
    const [selectedLote, setSelectedLote] = useState<number | null>(
        editingCrop?.loteId || editingCrop?.lote?.id || null
    );
    const [selectedSubLote, setSelectedSubLote] = useState<number | null>(
        editingCrop?.subLoteId || editingCrop?.sublote?.id || editingCrop?.subLote?.id || null
    );

    // Validation errors
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // UI Helpers
    const [showLoteMenu, setShowLoteMenu] = useState(false);
    const [showSubLoteMenu, setShowSubLoteMenu] = useState(false);
    const [showEstadoMenu, setShowEstadoMenu] = useState(false);

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
    const [snackbarFadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        fetchLotes();
    }, []);

    useEffect(() => {
        if (selectedLote) {
            fetchSubLotes(selectedLote);
        } else {
            setSublotes([]);
            if (isEditMode && selectedLote === (editingCrop?.loteId || editingCrop?.lote?.id)) {
                // Keep the sublote (it will be set in state already)
            } else {
                setSelectedSubLote(null);
            }
        }
    }, [selectedLote]);

    const showSnackbar = (message: string, type: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);

        Animated.timing(snackbarFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            hideSnackbar();
        }, 6000);
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

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showSnackbar('Se necesitan permisos para acceder a la galería', 'error');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                setImageFile(result.assets[0]);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            showSnackbar('Error al seleccionar la imagen', 'error');
        }
    };

    const fetchLotes = async () => {
        try {
            const res = await geoAPI.getLotes();
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setLotes(data);
        } catch (error) {
            console.error('Error loading lotes', error);
            showSnackbar('No se pudieron cargar los lotes', 'error');
        }
    };

    const fetchSubLotes = async (loteId: number) => {
        try {
            const res = await geoAPI.getSubLotes();
            const allSub = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const filtered = allSub.filter((s: SubLote) => s.loteId === loteId);
            setSublotes(filtered);

            if (isEditMode && editingCrop) {
                const targetSubId = editingCrop.subLoteId || editingCrop.sublote?.id || editingCrop.subLote?.id;
                if (targetSubId && filtered.find(s => s.id === targetSubId)) {
                    setSelectedSubLote(targetSubId);
                }
            }
        } catch (error) {
            console.error('Error loading sublotes', error);
        }
    };

    const validate = () => {
        const newErrors: any = {};
        if (!nombreCultivo.trim()) newErrors.nombreCultivo = 'El nombre es obligatorio';
        if (!tipoCultivo.trim()) newErrors.tipoCultivo = 'El tipo de cultivo es obligatorio';
        if (!selectedLote && !selectedSubLote) newErrors.ubicacion = 'Debe seleccionar un lote';

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (fechaInicio && !dateRegex.test(fechaInicio)) newErrors.fechaInicio = 'Formato inválido (YYYY-MM-DD)';
        if (!dateRegex.test(fechaSiembra)) newErrors.fechaSiembra = 'Formato inválido (YYYY-MM-DD)';
        if (fechaFinalizacion && !dateRegex.test(fechaFinalizacion)) newErrors.fechaFinalizacion = 'Formato inválido (YYYY-MM-DD)';

        if (selectedLote && sublotes.length > 0 && !selectedSubLote) {
            newErrors.ubicacion = 'El lote tiene sublotes, seleccione uno';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showSnackbar('Complete todos los campos requeridos correctamente', 'error');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const payloadJSON: any = {
                nombreCultivo,
                tipoCultivo,
                descripcion: descripcion || undefined,
                estado: estado.toUpperCase(),
                motivo: motivo || undefined,
                fechaSiembra: fechaSiembra.split('T')[0],
                fechaFinalizacion: fechaFinalizacion ? fechaFinalizacion.split('T')[0] : undefined,
                loteId: selectedLote ? Number(selectedLote) : undefined,
                subLoteId: selectedSubLote ? Number(selectedSubLote) : undefined,
            };
            if (payloadJSON.subLoteId) delete payloadJSON.loteId;

            console.log(isEditMode ? 'Updating crop...' : 'Creating crop...');

            if (imageFile) {
                const finalFormData = new FormData();
                // Append text fields
                Object.keys(payloadJSON).forEach(key => {
                    if (payloadJSON[key] !== undefined && payloadJSON[key] !== null) {
                        finalFormData.append(key, String(payloadJSON[key]));
                    }
                });
                // Append file with key 'img' (Backend expects 'img')
                finalFormData.append('img', {
                    uri: imageFile.uri,
                    type: 'image/jpeg',
                    name: 'crop_image.jpg',
                } as any);

                if (isEditMode) {
                    await cropsAPI.update(editingCrop.id, finalFormData);
                } else {
                    await cropsAPI.create(finalFormData as any);
                }
            } else {
                if (isEditMode) {
                    await cropsAPI.update(editingCrop.id, payloadJSON);
                } else {
                    await cropsAPI.create(payloadJSON);
                }
            }

            if (isEditMode) {
                showSnackbar('Cultivo editado correctamente', 'success');
            } else {
                showSnackbar('Cultivo registrado correctamente', 'success');
            }

            setTimeout(() => {
                navigation.goBack();
            }, 2000);

        } catch (error: any) {
            console.error(isEditMode ? 'Error updating crop:' : 'Error creating crop:', error);

            let errorMessage = isEditMode ? 'No se pudo actualizar el cultivo' : 'El cultivo no se pudo registrar';
            let errorDetails = '';

            if (error.response) {
                const { data } = error.response;
                if (data.message) {
                    const serverMessage = Array.isArray(data.message)
                        ? data.message.join('\n')
                        : data.message;
                    errorDetails = serverMessage;
                } else if (typeof data === 'string') {
                    errorDetails = data;
                }
            } else if (error.request) {
                errorMessage = 'Error de conexión';
            } else {
                errorMessage = 'Error en la solicitud';
                errorDetails = error.message;
            }

            const fullMessage = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
            showSnackbar(fullMessage, 'error');

        } finally {
            setLoading(false);
        }
    };

    const getLoteName = () => lotes.find(l => l.id === selectedLote)?.nombre || 'Seleccionar Lote';
    const getSubLoteName = () => sublotes.find(s => s.id === selectedSubLote)?.nombre || 'Seleccionar Sublote (Opcional)';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text variant="headlineSmall" style={styles.title}>
                    {isEditMode ? 'Editar Cultivo' : 'Nuevo Cultivo'}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Upload size={40} color="#666" />
                                <Text style={styles.uploadText}>Subir Imagen del Cultivo</Text>
                            </View>
                        )}
                        <View style={styles.editIconContainer}>
                            <Text style={{ fontSize: 10, color: '#fff' }}>Editar</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Información Principal */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        <Sprout size={18} color="#166534" /> Información Principal
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nombre del Cultivo *</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Ej. Maíz Lote Norte"
                            value={nombreCultivo}
                            onChangeText={setNombreCultivo}
                            error={!!errors.nombreCultivo}
                            style={styles.input}
                        />
                        {errors.nombreCultivo && <HelperText type="error">{errors.nombreCultivo}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tipo de Cultivo *</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Ej. Maíz, Papa, Tomate"
                            value={tipoCultivo}
                            onChangeText={setTipoCultivo}
                            error={!!errors.tipoCultivo}
                            style={styles.input}
                        />
                        {errors.tipoCultivo && <HelperText type="error">{errors.tipoCultivo}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Estado</Text>
                        <Menu
                            visible={showEstadoMenu}
                            onDismiss={() => setShowEstadoMenu(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setShowEstadoMenu(true)} style={styles.selector}>
                                    <Text style={{ color: '#000', textTransform: 'capitalize' }}>{estado}</Text>
                                </TouchableOpacity>
                            }
                        >
                            <Menu.Item onPress={() => { setEstado('activo'); setShowEstadoMenu(false); }} title="Activo" />
                            <Menu.Item onPress={() => { setEstado('inactivo'); setShowEstadoMenu(false); }} title="Inactivo" />
                            <Menu.Item onPress={() => { setEstado('finalizado'); setShowEstadoMenu(false); }} title="Finalizado" />
                        </Menu>
                    </View>

                    {isEditMode && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Motivo del cambio</Text>
                            <TextInput
                                mode="outlined"
                                placeholder="Razón del cambio de estado o edición..."
                                value={motivo}
                                onChangeText={setMotivo}
                                multiline
                                numberOfLines={2}
                                style={styles.input}
                            />
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Detalles adicionales..."
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Ubicación */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        <MapPin size={18} color="#2563eb" /> Ubicación
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Lote *</Text>
                        <Menu
                            visible={showLoteMenu}
                            onDismiss={() => setShowLoteMenu(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setShowLoteMenu(true)} style={styles.selector}>
                                    <Text style={{ color: selectedLote ? '#000' : '#666' }}>{getLoteName()}</Text>
                                </TouchableOpacity>
                            }
                        >
                            {lotes.map(lote => (
                                <Menu.Item
                                    key={lote.id}
                                    onPress={() => {
                                        setSelectedLote(lote.id);
                                        setShowLoteMenu(false);
                                        setSelectedSubLote(null);
                                    }}
                                    title={lote.nombre}
                                />
                            ))}
                        </Menu>
                    </View>

                    {selectedLote && sublotes.length > 0 && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Sublote</Text>
                            <Menu
                                visible={showSubLoteMenu}
                                onDismiss={() => setShowSubLoteMenu(false)}
                                anchor={
                                    <TouchableOpacity onPress={() => setShowSubLoteMenu(true)} style={styles.selector}>
                                        <Text style={{ color: selectedSubLote ? '#000' : '#666' }}>{getSubLoteName()}</Text>
                                    </TouchableOpacity>
                                }
                            >
                                <Menu.Item
                                    onPress={() => {
                                        setSelectedSubLote(null);
                                        setShowSubLoteMenu(false);
                                    }}
                                    title="Ninguno (Usar Lote completo)"
                                />
                                <Divider />
                                {sublotes.map(sub => (
                                    <Menu.Item
                                        key={sub.id}
                                        onPress={() => {
                                            setSelectedSubLote(sub.id);
                                            setShowSubLoteMenu(false);
                                        }}
                                        title={sub.nombre}
                                    />
                                ))}
                            </Menu>
                        </View>
                    )}

                    {errors.ubicacion && <HelperText type="error">{errors.ubicacion}</HelperText>}
                </View>

                {/* Cronograma */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        <Clock size={18} color="#d97706" /> Cronograma
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Fecha Inicio (YYYY-MM-DD)</Text>
                        <TextInput
                            mode="outlined"
                            value={fechaInicio}
                            onChangeText={setFechaInicio}
                            placeholder="YYYY-MM-DD"
                            right={<TextInput.Icon icon={() => <Calendar size={20} color="#666" />} />}
                            style={styles.input}
                            error={!!errors.fechaInicio}
                        />
                        {errors.fechaInicio && <HelperText type="error">{errors.fechaInicio}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Fecha Siembra</Text>
                        <TextInput
                            mode="outlined"
                            value={fechaSiembra}
                            onChangeText={setFechaSiembra}
                            placeholder="YYYY-MM-DD"
                            right={<TextInput.Icon icon={() => <Calendar size={20} color="#666" />} />}
                            style={styles.input}
                            error={!!errors.fechaSiembra}
                        />
                        {errors.fechaSiembra && <HelperText type="error">{errors.fechaSiembra}</HelperText>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Fecha Finalización Estimada (Opcional)</Text>
                        <TextInput
                            mode="outlined"
                            value={fechaFinalizacion}
                            onChangeText={setFechaFinalizacion}
                            placeholder="YYYY-MM-DD"
                            right={<TextInput.Icon icon={() => <Calendar size={20} color="#666" />} />}
                            style={styles.input}
                            error={!!errors.fechaFinalizacion}
                        />
                        {errors.fechaFinalizacion && <HelperText type="error">{errors.fechaFinalizacion}</HelperText>}
                    </View>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                    buttonColor="#166534"
                    icon={() => <Save size={20} color="white" />}
                    contentStyle={{ paddingVertical: 4 }}
                >
                    {isEditMode ? 'Actualizar Cultivo' : 'Guardar Cultivo'}
                </Button>

            </ScrollView>

            {/* Snackbar/Toast Notification */}
            {snackbarVisible && (
                <Animated.View
                    style={[
                        styles.snackbar,
                        snackbarType === 'success' ? styles.snackbarSuccess : styles.snackbarError,
                        {
                            opacity: snackbarFadeAnim, transform: [{
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
                            <X size={20} color={snackbarType === 'success' ? '#14532d' : '#7f1d1d'} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    imageSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        marginTop: 8,
        color: '#64748b',
        fontWeight: '500',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
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
    section: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
});

export default CreateCropScreen;