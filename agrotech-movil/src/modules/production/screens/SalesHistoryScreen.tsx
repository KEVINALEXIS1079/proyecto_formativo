import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { productionAPI } from '../../../shared/services/api';
import { Card, Chip } from 'react-native-paper'; // Assuming react-native-paper is used in the project
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Venta {
    id: number;
    clienteId?: number;
    cliente?: {
        id: number;
        nombre: string;
        identificacion?: string;
    };
    fecha: string;
    subtotal: number;
    impuestos: number;
    total: number;
    estado: string;
    detalles: any[];
}

const SalesHistoryScreen = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchVentas = async () => {
        try {
            const response = await productionAPI.getVentas();
            // Sort by ID desc or Date desc usually
            const sorted = response.data.sort((a: Venta, b: Venta) => b.id - a.id);
            setVentas(sorted);
        } catch (error) {
            console.error("Error fetching sales:", error);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchVentas().finally(() => setLoading(false));
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchVentas();
        setRefreshing(false);
    }, []);

    const renderItem = ({ item }: { item: Venta }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <Text style={styles.saleId}>#{String(item.id).padStart(6, '0')}</Text>
                    <Chip
                        mode="flat"
                        textStyle={{ color: 'white', fontSize: 10 }}
                        style={[styles.chip, { backgroundColor: item.estado === 'completada' ? '#10B981' : '#EF4444' }]}
                    >
                        {item.estado.toUpperCase()}
                    </Chip>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Fecha:</Text>
                    <Text style={styles.value}>{format(new Date(item.fecha), "dd MMM yyyy HH:mm", { locale: es })}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Cliente:</Text>
                    <Text style={styles.value}>{item.cliente?.nombre || "Consumidor Final"}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Items:</Text>
                    <Text style={styles.value}>{item.detalles?.length || 0} productos</Text>
                </View>

                <View style={[styles.row, { marginTop: 8 }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: 'bold' }]}>Total:</Text>
                    <Text style={[styles.totalValue]}>${item.total.toLocaleString()}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#166534" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Historial de Ventas</Text>
                <Text style={styles.subtitle}>Registro de transacciones</Text>
            </View>

            <FlatList
                data={ventas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay ventas registradas.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827'
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280'
    },
    listContent: {
        padding: 16
    },
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 2
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    saleId: {
        fontSize: 14,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#374151'
    },
    chip: {
        height: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    label: {
        fontSize: 14,
        color: '#6B7280'
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827'
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669'
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center'
    },
    emptyText: {
        color: '#9CA3AF'
    }
});

export default SalesHistoryScreen;
