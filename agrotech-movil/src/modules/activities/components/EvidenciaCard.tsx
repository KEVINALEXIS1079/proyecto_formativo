import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera, Trash2 } from 'lucide-react-native';
import { ActivityEvidencia } from '../types';

interface EvidenciaCardProps {
  evidencia: ActivityEvidencia;
  onDelete?: () => void;
  onPress?: () => void;
}

const EvidenciaCard: React.FC<EvidenciaCardProps> = ({ 
  evidencia, 
  onDelete,
  onPress 
}) => {
  const primeraImagen = evidencia.imagenes && evidencia.imagenes.length > 0 
    ? evidencia.imagenes[0] 
    : null;

  const fechaCreacion = evidencia.createdAt 
    ? new Date(evidencia.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {primeraImagen ? (
          <Image 
            source={{ uri: primeraImagen }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Camera size={32} color="#9ca3af" />
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}
        
        {evidencia.imagenes && evidencia.imagenes.length > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{evidencia.imagenes.length - 1}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.descripcion} numberOfLines={2}>
          {evidencia.descripcion || 'Sin descripción'}
        </Text>
        
        {fechaCreacion && (
          <Text style={styles.fecha}>{fechaCreacion}</Text>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={16} color="#dc2626" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  descripcion: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  fecha: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 20,
    padding: 8,
  },
});

export default EvidenciaCard;
