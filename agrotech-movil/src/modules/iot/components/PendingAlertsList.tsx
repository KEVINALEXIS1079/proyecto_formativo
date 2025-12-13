import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { AlertTriangle, ChevronRight, RefreshCw } from 'lucide-react-native';
import { iotAPI } from '../services/iot.api';

interface PendingAlertsListProps {
    loteId: number | null;
}

export const PendingAlertsList: React.FC<PendingAlertsListProps> = ({ loteId }) => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const from = new Date();
            from.setDate(from.getDate() - 7);

            const res = await iotAPI.getAlerts({
                loteId: loteId ?? undefined,
                from: from.toISOString()
            });
            setAlerts(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, [loteId]);

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <AlertTriangle size={20} color="#F59E0B" />
                        <Text style={styles.title}>Alertas Recientes</Text>
                    </View>
                    <TouchableOpacity onPress={fetchAlerts} disabled={loading}>
                        {loading ? <ActivityIndicator size="small" color="#6B7280" /> : <RefreshCw size={18} color="#6B7280" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.listContainer}>
                    {alerts.length === 0 && !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No hay alertas recientes.</Text>
                        </View>
                    ) : (
                        alerts.slice(0, 5).map((alert) => (
                            <TouchableOpacity key={alert.id} style={styles.alertItem}>
                                <View style={styles.alertRow}>
                                    <View style={[styles.dot, { backgroundColor: (alert.tipo === 'HIGH' || alert.tipo === 'MAX') ? '#EF4444' : '#F59E0B' }]} />
                                    <View style={styles.alertInfo}>
                                        <Text style={styles.sensorName}>{alert.sensor?.nombre || `Sensor ${alert.sensorId}`}</Text>
                                        <Text style={styles.date}>{new Date(alert.fechaAlerta).toLocaleDateString()} {new Date(alert.fechaAlerta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>
                                </View>
                                <View style={styles.valueContainer}>
                                    <Text style={styles.value}>{alert.valor}</Text>
                                    <Text style={styles.threshold}>Umbral: {alert.umbral}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2
    },
    content: {
        padding: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 8
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827'
    },
    listContainer: {
        gap: 0
    },
    emptyState: {
        padding: 24,
        alignItems: 'center'
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB'
    },
    alertRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        flex: 1
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6
    },
    alertInfo: {
        flex: 1
    },
    sensorName: {
        fontWeight: '600',
        color: '#374151',
        fontSize: 14
    },
    date: {
        fontSize: 10,
        color: '#9CA3AF'
    },
    valueContainer: {
        alignItems: 'flex-end'
    },
    value: {
        fontWeight: 'bold',
        color: '#4B5563',
        fontSize: 14
    },
    threshold: {
        fontSize: 10,
        color: '#9CA3AF'
    }
});
