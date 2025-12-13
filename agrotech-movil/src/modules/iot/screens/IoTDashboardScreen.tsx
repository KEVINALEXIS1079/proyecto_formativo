import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { geoAPI } from '../../../shared/services/api';
import { iotAPI } from '../services/iot.api';
import { IoTFilters } from '../components/IoTFilters';
import { SummaryCard } from '../components/SummaryCard';
import { SensorCharts } from '../components/SensorCharts';
import { PendingAlertsList } from '../components/PendingAlertsList';
import { useIoTLotCharts } from '../hooks/useIoTLotCharts';
import type { Sensor } from '../model/iot.types';

export const IoTDashboardScreen = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [lotes, setLotes] = useState<any[]>([]);
    const [subLotes, setSubLotes] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);
    const [selectedSubLoteId, setSelectedSubLoteId] = useState<number | null>(null);
    const [isAutoMode, setIsAutoMode] = useState(true);

    // Carousel State
    const [carouselIndex, setCarouselIndex] = useState(0);

    const fetchInitialData = async () => {
        try {
            const [lotesRes, sensorsRes] = await Promise.all([
                geoAPI.getLotes(), // Assuming getLotes returns all lotes
                iotAPI.getSensors()
            ]);
            setLotes(lotesRes.data);
            setSensors(sensorsRes.data);
        } catch (err) {
            console.error('Error fetching initial IoT data:', err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchInitialData();
        setRefreshing(false);
    };

    const handleSetLote = (id: number | null) => {
        setSelectedLoteId(id);
        if (id !== null) {
            setIsAutoMode(false);
        } else {
            setIsAutoMode(true);
            setCarouselIndex(0);
        }
    };

    // Carousel Logic
    useEffect(() => {
        if (!isAutoMode || lotes.length === 0 || selectedLoteId !== null) return;

        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % lotes.length);
        }, 20000);

        return () => clearInterval(interval);
    }, [isAutoMode, lotes.length, selectedLoteId]);

    const effectiveLoteId = selectedLoteId ?? (lotes.length > 0 ? lotes[carouselIndex]?.id : null);

    useEffect(() => {
        const fetchSubLotes = async () => {
            if (!effectiveLoteId) {
                setSubLotes([]);
                return;
            }
            // geoAPI doesn't have getSubLotes by loteId? user didn't show me that param in preview, 
            // but usually API helper handles it or I filter locally if getSubLotes returns all.
            // Based on shared/api/api.ts seen earlier, geoAPI.getSubLotes() gets ALL.
            // So I might need to filter client side or backend handles it.
            // Let's assume client side filter for safety or if query param supported.
            try {
                // Attempting to filter client-side as api.ts showed generic get()
                const res = await geoAPI.getSubLotes();
                const allSubs = res.data;
                setSubLotes(allSubs.filter((s: any) => s.loteId === effectiveLoteId));
            } catch (err) {
                console.error('Error fetching sublotes:', err);
                setSubLotes([]);
            }
        };
        fetchSubLotes();
    }, [effectiveLoteId]);

    const filteredSensors = useMemo(() => {
        if (!effectiveLoteId) return sensors;
        return sensors.filter((s) => {
            const matchLote = s.loteId === effectiveLoteId;
            const matchSubLote = selectedSubLoteId ? s.subLoteId === selectedSubLoteId : true;
            return matchLote && matchSubLote;
        });
    }, [sensors, effectiveLoteId, selectedSubLoteId]);

    const { timeSeriesData, sensorSummaryData, loading, isLive } = useIoTLotCharts(
        filteredSensors,
        effectiveLoteId,
        selectedSubLoteId,
        undefined, // Date range undefined -> Live
        null,
        true
    );

    const totalSensors = sensors.length;
    const activos = sensors.filter((s) => s.activo).length;
    const desconectados = sensors.filter((s) => s.estadoConexion === 'DESCONECTADO').length;
    // Unique lotes count
    const lotesConSensores = new Set(sensors.map((s) => s.loteId)).size;

    const labeledSeries = useMemo(() => {
        const loteMap = new Map<number | null, string>();
        lotes.forEach((l: any) => loteMap.set(l.id, l.nombre));
        return timeSeriesData.map((serie) => {
            const sensor = filteredSensors.find((s) => s.id === serie.sensorId);
            const loteName = sensor?.loteId ? loteMap.get(sensor.loteId) || `Lote ${sensor.loteId}` : 'Sin lote';
            const sub = sensor?.subLoteId ? ` / Sub ${sensor.subLoteId}` : '';
            return {
                ...serie,
                name: `${loteName}${sub} - ${serie.name || sensor?.nombre || 'Sensor'}`,
            };
        });
    }, [timeSeriesData, filteredSensors, lotes]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.headerTitle}>Dashboard IoT</Text>

            {/* Summary Cards Row */}
            <View style={styles.summaryRow}>
                <SummaryCard title="Sensores" value={totalSensors} icon="box" />
                <SummaryCard title="Activos" value={activos} icon="wifi" color="success" />
            </View>
            <View style={styles.summaryRow}>
                <SummaryCard title="Desconectados" value={desconectados} icon="wifi-off" color="danger" />
                <SummaryCard title="Lotes Monitor" value={lotesConSensores} icon="map" info="Activos" />
            </View>

            <View style={styles.spacer} />

            <IoTFilters
                selectedLoteId={effectiveLoteId}
                setSelectedLoteId={handleSetLote}
                selectedSubLoteId={selectedSubLoteId}
                setSelectedSubLoteId={setSelectedSubLoteId}
                lotes={lotes}
                subLotes={subLotes}
                isAutoMode={isAutoMode}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Visión General de Sensores</Text>
                <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>{isLive ? 'En vivo' : 'Histórico'}</Text>
                </View>
            </View>

            <SensorCharts
                timeSeriesData={labeledSeries}
                sensorSummaryData={sensorSummaryData}
                loading={loading}
                isLive={isLive}
                sensors={filteredSensors}
            />

            <View style={styles.spacer} />

            <PendingAlertsList loteId={effectiveLoteId} />

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        padding: 16
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8
    },
    spacer: {
        height: 24
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151'
    },
    liveBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    liveText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: 'bold'
    },
    bottomSpacer: {
        height: 48
    }
});
