import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Platform, Image
} from 'react-native';
import { X, Camera, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CreateActivityEvidenciaDto } from '../types';

interface EvidenciaModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateActivityEvidenciaDto) => Promise<void>;
}

const EvidenciaModal: React.FC<EvidenciaModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    descripcion: '',
    imagenes: [] as string[],
  });
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm({
        descripcion: '',
        imagenes: [],
      });
      setSelectedImages([]);
    }
  }, [visible]);

  const handleAddImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar imágenes');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const newImages = result.assets;
        setSelectedImages(prev => [...prev, ...newImages]);

        // For now, we'll store base64 strings. In production, you'd upload to a server
        const base64Uris = newImages.map(img => `data:image/jpeg;base64,${img.base64}`);
        setForm(prev => ({
          ...prev,
          imagenes: [...prev.imagenes, ...base64Uris]
        }));
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes');
    }
  };

  const handleSave = async () => {
    if (!form.descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        descripcion: form.descripcion.trim(),
        imagenes: form.imagenes,
      });
      onClose();
    } catch (error) {
      console.error('Error saving evidencia:', error);
      Alert.alert('Error', 'No se pudo guardar la evidencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Agregar Evidencia</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Descripción */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe la evidencia..."
                value={form.descripcion}
                onChangeText={(text) => setForm({ ...form, descripcion: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Imágenes */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Imágenes</Text>
              <TouchableOpacity style={styles.imageButton} onPress={handleAddImage}>
                <Plus size={24} color="#6b7280" />
                <Text style={styles.imageButtonText}>Seleccionar Imágenes</Text>
              </TouchableOpacity>

              {selectedImages.length > 0 && (
                <View style={styles.selectedImagesContainer}>
                  <Text style={styles.selectedImagesCount}>
                    {selectedImages.length} imagen(es) seleccionada(s)
                  </Text>
                  <View style={styles.imagesGrid}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => {
                            const newImages = selectedImages.filter((_, i) => i !== index);
                            const newImageUris = form.imagenes.filter((_, i) => i !== index);
                            setSelectedImages(newImages);
                            setForm(prev => ({ ...prev, imagenes: newImageUris }));
                          }}
                        >
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  textArea: {
    minHeight: 100,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  imagesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  imagesCount: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#166534',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: '#6b7280',
  },
  selectedImagesContainer: {
    marginTop: 12,
  },
  selectedImagesCount: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
    marginBottom: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
});

export default EvidenciaModal;
