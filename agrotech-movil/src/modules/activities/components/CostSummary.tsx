import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DollarSign, Users, Package, Wrench } from 'lucide-react-native';
import { ActivityCostSummary } from '../types';

interface CostSummaryProps {
  summary: ActivityCostSummary;
}

const CostSummary: React.FC<CostSummaryProps> = ({ summary }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Costos</Text>

      <View style={styles.itemsContainer}>
        <View style={styles.costItem}>
          <View style={styles.iconContainer}>
            <Users size={18} color="#166534" />
          </View>
          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Mano de Obra</Text>
            <Text style={styles.costValue}>
              ${summary.costoManoObra.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

        <View style={styles.costItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
            <Package size={18} color="#2563eb" />
          </View>
          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Insumos</Text>
            <Text style={styles.costValue}>
              ${summary.costoInsumos.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>

        <View style={styles.costItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Wrench size={18} color="#d97706" />
          </View>
          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Servicios</Text>
            <Text style={styles.costValue}>
              ${summary.costoServicios.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <View style={styles.totalIconContainer}>
          <DollarSign size={22} color="#fff" />
        </View>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>TOTAL GENERAL</Text>
          <Text style={styles.totalValue}>
            ${summary.costoTotal.toLocaleString('es-CO')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  costInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  totalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  totalInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
});

export default CostSummary;
