import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Sprout, Droplets, Scissors, ShoppingBasket, 
  Leaf, CheckCircle2, Clock, Edit2, Trash2 
} from 'lucide-react-native';
import { Activity, TipoActividad, SubtipoActividad } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getSubtipoIcon = (subtipo: SubtipoActividad) => {
  const iconProps = { size: 24, color: '#166534' };
  
  switch (subtipo) {
    case SubtipoActividad.SIEMBRA:
      return <Sprout {...iconProps} />;
    case SubtipoActividad.RIEGO:
      return <Droplets {...iconProps} />;
    case SubtipoActividad.PODA:
      return <Scissors {...iconProps} />;
    case SubtipoActividad.COSECHA:
      return <ShoppingBasket {...iconProps} />;
    case SubtipoActividad.FERTILIZACION:
    case SubtipoActividad.CONTROL_PLAGAS:
      return <Leaf {...iconProps} />;
    default:
      return <CheckCircle2 {...iconProps} />;
  }
};

const getTipoColor = (tipo: TipoActividad) => {
  switch (tipo) {
    case TipoActividad.CREACION:
      return '#16a34a'; // green-600
    case TipoActividad.MANTENIMIENTO:
      return '#2563eb'; // blue-600
    case TipoActividad.FINALIZACION:
      return '#dc2626'; // red-600
    default:
      return '#6b7280'; // gray-500
  }
};

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onPress, 
  onEdit, 
  onDelete 
}) => {
  const isPendiente = activity.estado === 'Pendiente';
  const tipoColor = getTipoColor(activity.tipo);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getSubtipoIcon(activity.subtipo)}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.nombre} numberOfLines={1}>
            {activity.nombre}
          </Text>
          <View style={[styles.estadoBadge, isPendiente ? styles.pendienteBadge : styles.finalizadaBadge]}>
            <Text style={styles.estadoText}>{activity.estado}</Text>
          </View>
        </View>

        <Text style={styles.descripcion} numberOfLines={2}>
          {activity.descripcion || 'Sin descripción'}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <View style={[styles.tipoBadge, { backgroundColor: `${tipoColor}15` }]}>
              <Text style={[styles.tipoText, { color: tipoColor }]}>
                {activity.tipo}
              </Text>
            </View>
            <Text style={styles.subtipo}>{activity.subtipo}</Text>
          </View>

          <View style={styles.detailItem}>
            <Clock size={14} color="#666" />
            <Text style={styles.fecha}>
              {new Date(activity.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {activity.costoManoObra > 0 && (
          <View style={styles.costoContainer}>
            <Text style={styles.costoLabel}>Costo MO:</Text>
            <Text style={styles.costoValue}>
              ${activity.costoManoObra.toLocaleString('es-CO')}
            </Text>
          </View>
        )}

        {(activity.lote || activity.cultivo) && (
          <View style={styles.ubicacion}>
            {activity.lote && (
              <Text style={styles.ubicacionText}>📍 {activity.lote.nombre}</Text>
            )}
            {activity.cultivo && (
              <Text style={styles.ubicacionText}>🌱 {activity.cultivo.nombre}</Text>
            )}
          </View>
        )}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 size={18} color="#15803d" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={18} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendienteBadge: {
    backgroundColor: '#fef3c7',
  },
  finalizadaBadge: {
    backgroundColor: '#d1fae5',
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  descripcion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subtipo: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  fecha: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  costoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  costoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 6,
  },
  costoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  ubicacion: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  ubicacionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  editButton: {
    backgroundColor: '#dcfce7',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
});

export default ActivityCard;
