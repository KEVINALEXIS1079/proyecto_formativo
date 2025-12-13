import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card, ProgressBar, ActivityIndicator } from 'react-native-paper';
import type { Sensor } from '../model/iot.types';

interface SensorChartsProps {
    timeSeriesData: any[];
    sensorSummaryData: any[];
    loading: boolean;
    isLive?: boolean;
    sensors?: Sensor[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const SensorCharts: React.FC<SensorChartsProps> = ({
    timeSeriesData,
    loading,
    isLive,
    sensors = []
}) => {
    if (loading && timeSeriesData.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#059669" />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    if (timeSeriesData.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay datos de sensores disponibles</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {timeSeriesData.map((series, index) => {
                const sensor = sensors.find(s => s.id === series.sensorId);
                const color = COLORS[index % COLORS.length];
                const lastValue = series.data.length > 0 ? series.data[series.data.length - 1].valor : 0;

                // Simple gauge calculation (assuming 0 to 100 or min/max from history)
                const allValues = series.data.map((d: any) => d.valor);
                const min = allValues.length ? Math.min(...allValues) : 0;
                const max = allValues.length ? Math.max(...allValues) : 100;
                const range = max - min || 100; // avoid div by 0
                const progress = Math.min(Math.max((lastValue - min) / range, 0), 1); // Normalize 0-1 (simple relative to history)

                // If it's a pump/boolean
                const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') || sensor.nombre?.toLowerCase().includes('bomba'));

                return (
                    <Card key={series.sensorId} style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sensorName}>{series.name}</Text>
                                {isPump ? (
                                    <Text style={[styles.pumpStatus, { color: lastValue > 0 ? '#10B981' : '#EF4444' }]}>
                                        {lastValue > 0 ? 'ON' : 'OFF'}
                                    </Text>
                                ) : (
                                    <Text style={[styles.sensorValue, { color }]}>{lastValue.toFixed(2)}</Text>
                                )}
                            </View>
                            {!isPump && (
                                <View style={styles.gaugeContainer}>
                                    <ProgressBar progress={progress} color={color} style={styles.progressBar} />
                                    <View style={styles.rangeLabels}>
                                        <Text style={styles.rangeText}>{min.toFixed(0)}</Text>
                                        <Text style={styles.rangeText}>{max.toFixed(0)}</Text>
                                    </View>
                                </View>
                            )}
                            <Text style={styles.lastUpdate}>
                                Última actualización: {series.data.length > 0 ? new Date(series.data[series.data.length - 1].fechaLectura).toLocaleTimeString() : '--:--'}
                            </Text>
                        </Card.Content>
                    </Card>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingVertical: 8
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280'
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center'
    },
    emptyText: {
        color: '#9CA3AF'
    },
    card: {
        backgroundColor: 'white',
        marginBottom: 8,
        borderRadius: 8,
        elevation: 2
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    sensorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151'
    },
    sensorValue: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    pumpStatus: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    gaugeContainer: {
        gap: 4
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB'
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    rangeText: {
        fontSize: 10,
        color: '#9CA3AF'
    },
    lastUpdate: {
        marginTop: 8,
        fontSize: 10,
        color: '#9CA3AF',
        textAlign: 'right'
    }
});
