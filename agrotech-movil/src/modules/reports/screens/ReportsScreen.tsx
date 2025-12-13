import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // You might need to install this or use a custom one
import { cropsAPI, reportsAPI } from '../../../shared/services/api';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { TrendingUp, Package, BarChart as BarChartIcon, Download, Calendar } from 'lucide-react-native';

const ReportsScreen = () => {
    const [cultivos, setCultivos] = useState<any[]>([]);
    const [selectedCultivoId, setSelectedCultivoId] = useState<number | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingCrops, setLoadingCrops] = useState(true);

    // Simple date state (YYYY-MM-DD for simplicity in mobile without heavy date picker lib)
    // In a real app we'd use DateTimePicker
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    useEffect(() => {
        fetchCultivos();
    }, []);

    const fetchCultivos = async () => {
        try {
            const res = await cropsAPI.getAll();
            setCultivos(res.data);
            setLoadingCrops(false);
        } catch (err) {
            console.error(err);
            setLoadingCrops(false);
        }
    };

    const fetchReport = async () => {
        if (!selectedCultivoId) return;
        setLoading(true);
        try {
            const res = await reportsAPI.getReporteCompleto(selectedCultivoId, {
                fechaDesde: fechaDesde || undefined,
                fechaHasta: fechaHasta || undefined,
            });
            setReportData(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'No se pudo generar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCultivoId) {
            fetchReport();
        }
    }, [selectedCultivoId, fechaDesde, fechaHasta]);

    const formatCurrency = (val: number) => {
        return '$' + val.toLocaleString('es-CO');
    };

    const SummaryCard = ({ title, value, color, icon: Icon }: any) => (
        <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <Card.Content style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Icon color={color} size={24} />
                </View>
                <View>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={[styles.cardValue, { color }]}>{value}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    const AnalysisBar = ({ label, value, max, color }: any) => (
        <View style={styles.barContainer}>
            <View style={styles.barHeader}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={styles.barValue}>{typeof value === 'number' ? formatCurrency(value) : value}</Text>
            </View>
            <ProgressBar progress={max > 0 ? value / max : 0} color={color} style={styles.progressBar} />
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>Reportes de Cultivos</Text>

            {/* Filters */}
            <Card style={styles.filterCard}>
                <Card.Content>
                    <Text style={styles.filterLabel}>Seleccionar Cultivo:</Text>
                    <View style={styles.pickerContainer}>
                        {loadingCrops ? (
                            <ActivityIndicator />
                        ) : (
                            <Picker
                                selectedValue={selectedCultivoId || ""}
                                onValueChange={(itemValue) => setSelectedCultivoId(itemValue ? Number(itemValue) : null)}
                            >
                                <Picker.Item label="Seleccione un cultivo..." value="" />
                                {cultivos.map((c) => (
                                    <Picker.Item key={c.id} label={c.nombre} value={c.id} />
                                ))}
                            </Picker>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#166534" />
                    <Text style={{ marginTop: 10 }}>Generando reporte...</Text>
                </View>
            )}

            {!loading && !reportData && !selectedCultivoId && (
                <View style={styles.emptyState}>
                    <Package size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>Seleccione un cultivo para ver el reporte</Text>
                </View>
            )}

            {!loading && reportData && (
                <View style={styles.reportContainer}>

                    {/* Summary Cards Grid */}
                    <View style={styles.grid}>
                        <View style={styles.col}>
                            <SummaryCard
                                title="Ingresos"
                                value={formatCurrency(reportData.resumen.ingresoTotal)}
                                color="#16a34a"
                                icon={TrendingUp}
                            />
                        </View>
                        <View style={styles.col}>
                            <SummaryCard
                                title="Costos"
                                value={formatCurrency(reportData.resumen.costoTotal)}
                                color="#dc2626"
                                icon={Package}
                            />
                        </View>
                    </View>
                    <View style={styles.grid}>
                        <View style={styles.col}>
                            <SummaryCard
                                title="Utilidad"
                                value={formatCurrency(reportData.resumen.utilidadNeta)}
                                color="#ca8a04"
                                icon={BarChartIcon}
                            />
                        </View>
                        <View style={styles.col}>
                            <SummaryCard
                                title="Margen"
                                value={`${reportData.resumen.margenNeto.toFixed(1)}%`}
                                color="#2563eb"
                                icon={TrendingUp}
                            />
                        </View>
                    </View>

                    {/* Indicators */}
                    <Card style={styles.sectionCard}>
                        <Card.Title title="Indicadores de Rentabilidad" titleStyle={styles.cardHeaderTitle} />
                        <Card.Content>
                            <View style={styles.indicatorRow}>
                                <View style={styles.indicatorBox}>
                                    <Text style={styles.indicatorLabel}>ROI</Text>
                                    <Text style={[styles.indicatorValue, { color: reportData.resumen.roi >= 0 ? '#16a34a' : '#dc2626' }]}>
                                        {reportData.resumen.roi.toFixed(2)}%
                                    </Text>
                                    <Text style={styles.indicatorSub}>Retorno Inversión</Text>
                                </View>
                                <View style={[styles.indicatorBox, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
                                    <Text style={styles.indicatorLabel}>Relación B/C</Text>
                                    <Text style={[styles.indicatorValue, { color: reportData.resumen.relacionBC > 1 ? '#2563eb' : '#dc2626' }]}>
                                        {reportData.resumen.relacionBC.toFixed(2)}
                                    </Text>
                                    <Text style={styles.indicatorSub}>Beneficio / Costo</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Financial Analysis (Bars instead of Charts) */}
                    <Card style={styles.sectionCard}>
                        <Card.Title title="Análisis Financiero" titleStyle={styles.cardHeaderTitle} />
                        <Card.Content>
                            <AnalysisBar
                                label="Ingresos Totales"
                                value={reportData.resumen.ingresoTotal}
                                max={Math.max(reportData.resumen.ingresoTotal, reportData.resumen.costoTotal) * 1.2}
                                color="#16a34a"
                            />
                            <AnalysisBar
                                label="Costos Totales"
                                value={reportData.resumen.costoTotal}
                                max={Math.max(reportData.resumen.ingresoTotal, reportData.resumen.costoTotal) * 1.2}
                                color="#dc2626"
                            />
                            <AnalysisBar
                                label="Utilidad Neta"
                                value={reportData.resumen.utilidadNeta}
                                max={Math.max(reportData.resumen.ingresoTotal, reportData.resumen.costoTotal) * 1.2}
                                color="#ca8a04"
                            />
                        </Card.Content>
                    </Card>

                    {/* Export Button Placeholder */}
                    <Button
                        mode="contained"
                        icon="download"
                        style={styles.exportButton}
                        buttonColor="#166534"
                        onPress={() => Alert.alert('Exportar PDF', 'La generación de PDF estará disponible en la próxima actualización.')}
                    >
                        Exportar Reporte PDF
                    </Button>

                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937'
    },
    filterCard: {
        marginBottom: 16,
        backgroundColor: 'white'
    },
    filterLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        backgroundColor: '#f9fafb'
    },
    dateRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center'
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40
    },
    emptyText: {
        color: '#9ca3af',
        marginTop: 10,
        fontSize: 16
    },
    reportContainer: {
        gap: 16
    },
    grid: {
        flexDirection: 'row',
        gap: 12
    },
    col: {
        flex: 1
    },
    card: {
        backgroundColor: 'white',
        elevation: 2
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    iconBox: {
        padding: 8,
        borderRadius: 8
    },
    cardTitle: {
        color: '#6b7280',
        fontSize: 12
    },
    cardValue: {
        fontWeight: 'bold',
        fontSize: 16
    },
    sectionCard: {
        backgroundColor: 'white',
        elevation: 2
    },
    cardHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151'
    },
    indicatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10
    },
    indicatorBox: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10
    },
    indicatorLabel: {
        color: '#6b7280',
        fontSize: 14,
        marginBottom: 4
    },
    indicatorValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4
    },
    indicatorSub: {
        fontSize: 12,
        color: '#9ca3af'
    },
    barContainer: {
        marginBottom: 16
    },
    barHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    barLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151'
    },
    barValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151'
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f3f4f6'
    },
    exportButton: {
        marginTop: 8
    }
});

export default ReportsScreen;
