import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wrench, Clock, DollarSign, Edit2, Trash2 } from 'lucide-react-native';
import { ActivityServicio } from '../types';

interface ServicioItemProps {
  servicio: ActivityServicio;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ServicioItem: React.FC<ServicioItemProps> = ({ 
  servicio, 
  onEdit, 
  onDelete 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Wrench size={20} color="#166534" />
      </View>

      <View style={styles.content}>
        <Text style={styles.nombre}>{servicio.nombreServicio}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.detailText}>{servicio.horas}h</Text>
          </View>
          
          <View style={styles.detailItem}>
            <DollarSign size={14} color="#6b7280" />
            <Text style={styles.detailText}>
              ${servicio.precioHora.toLocaleString('es-CO')}/h
            </Text>
          </View>
        </View>

        <View style={styles.costoContainer}>
          <Text style={styles.costoLabel}>Total:</Text>
          <Text style={styles.costoValue}>
            ${servicio.costo.toLocaleString('es-CO')}
          </Text>
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
              <Edit2 size={16} color="#15803d" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  costoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 4,
  },
  costoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#dcfce7',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
});

export default ServicioItem;
