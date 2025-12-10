import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Package, Hash, DollarSign, Edit2, Trash2 } from 'lucide-react-native';
import { ActivityInsumoUso } from '../types';

interface InsumoItemProps {
  insumo: ActivityInsumoUso;
  onEdit?: () => void;
  onDelete?: () => void;
}

const InsumoItem: React.FC<InsumoItemProps> = ({ 
  insumo, 
  onEdit, 
  onDelete 
}) => {
  const nombreInsumo = insumo.insumo?.nombre || 'Insumo desconocido';
  const unidad = insumo.insumo?.unidad || 'und';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Package size={20} color="#166534" />
      </View>

      <View style={styles.content}>
        <Text style={styles.nombre}>{nombreInsumo}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Hash size={14} color="#6b7280" />
            <Text style={styles.detailText}>
              {insumo.cantidadUso} {unidad}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <DollarSign size={14} color="#6b7280" />
            <Text style={styles.detailText}>
              ${insumo.costoUnitarioUso.toLocaleString('es-CO')}/{unidad}
            </Text>
          </View>
        </View>

        <View style={styles.costoContainer}>
          <Text style={styles.costoLabel}>Total:</Text>
          <Text style={styles.costoValue}>
            ${insumo.costoTotal.toLocaleString('es-CO')}
          </Text>
        </View>

        {insumo.insumo && (
          <Text style={styles.stock}>
            Stock disponible: {insumo.insumo.cantidad} {unidad}
          </Text>
        )}
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
    backgroundColor: '#dbeafe',
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
    marginBottom: 2,
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
  stock: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
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

export default InsumoItem;
