import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Font registration if needed
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        padding: 40, // Standard 2.5cm margin roughly (40pt)
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#111827', // Gray-900
        paddingBottom: 10,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        marginRight: 10,
        objectFit: 'contain',
    },
    brandName: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        letterSpacing: 1,
    },
    reportTitleContainer: {
        alignItems: 'flex-end',
    },
    reportMainTitle: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        textTransform: 'uppercase',
    },
    reportSubTitle: {
        fontSize: 9,
        color: '#6B7280', // Gray-500
        marginTop: 4,
    },
    metaSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#F9FAFB', // Gray-50
        padding: 10,
        borderRadius: 4,
    },
    metaColumn: {
        flexDirection: 'column',
    },
    metaLabel: {
        fontSize: 8,
        color: '#6B7280',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontFamily: 'Helvetica-Bold',
    },
    metaValue: {
        fontSize: 10,
        color: '#111827',
        fontFamily: 'Helvetica',
    },
    section: {
        marginBottom: 15,
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        marginBottom: 8,
        backgroundColor: '#E5E7EB',
        padding: 6,
        borderRadius: 2,
    },
    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricCard: {
        width: '32%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 8,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    metricValue: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    // Table Styles
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        padding: 8,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        padding: 8,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#4B5563',
    },
    totalRow: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#F9FAFB',
        justifyContent: 'flex-end',
    },
    utilityBox: {
        marginTop: 10,
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#ECFDF5', // Green-50
        borderWidth: 1,
        borderColor: '#10B981', // Green-500
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    utilityLabel: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#065F46', // Green-800
    },
    utilityValue: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#065F46',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
    },
});

interface ReportePDFProps {
    data: any;
    cultivoNombre: string;
    selectedSections: string[];
    iotData?: any;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val);

export const ReportePDF = ({ data, cultivoNombre, selectedSections, iotData }: ReportePDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Image src="/logoAgrotech.png" style={styles.logo} />
                    </View>
                    <View style={styles.reportTitleContainer}>
                        <Text style={styles.reportMainTitle}>Reporte de Cultivo</Text>
                        <Text style={styles.reportSubTitle}>Generado el {new Date().toLocaleDateString('es-CO')}</Text>
                    </View>
                </View>

                {/* META INFO */}
                <View style={styles.metaSection}>
                    <View style={styles.metaColumn}>
                        <Text style={styles.metaLabel}>CULTIVO / LOTE</Text>
                        <Text style={styles.metaValue}>{cultivoNombre || 'General'}</Text>
                    </View>
                    <View style={styles.metaColumn}>
                        <Text style={styles.metaLabel}>ID REPORTE</Text>
                        <Text style={styles.metaValue}>{`RPT-${new Date().getTime().toString().slice(-6)}`}</Text>
                    </View>
                    <View style={styles.metaColumn}>
                        <Text style={styles.metaLabel}>PERIODO</Text>
                        <Text style={styles.metaValue}>Acumulado Actual</Text>
                    </View>
                </View>

                {/* RESUMEN FINANCIERO */}
                {selectedSections.includes('resumen') ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Resumen Financiero</Text>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Ingresos Totales</Text>
                                <Text style={{ ...styles.metricValue, color: '#10B981' }}>
                                    {formatCurrency(data.resumen.ingresoTotal)}
                                </Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Costos Totales</Text>
                                <Text style={{ ...styles.metricValue, color: '#EF4444' }}>
                                    {formatCurrency(data.resumen.costoTotal)}
                                </Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Margen Neto</Text>
                                <Text style={{ ...styles.metricValue, color: '#3B82F6' }}>
                                    {data.resumen.margenNeto.toFixed(1)}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.utilityBox}>
                            <Text style={styles.utilityLabel}>UTILIDAD NETA TOTAL</Text>
                            <Text style={styles.utilityValue}>{formatCurrency(data.resumen.utilidadNeta)}</Text>
                        </View>
                    </View>
                ) : null}

                {/* RENTABILIDAD DETALLADA */}
                {selectedSections.includes('rentabilidad') ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Indicadores de Rentabilidad</Text>
                        <View style={{ ...styles.metricsGrid, marginBottom: 0 }}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Relación B/C</Text>
                                <Text style={styles.metricValue}>{data.resumen.relacionBC.toFixed(2)}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>ROI (Retorno Inversión)</Text>
                                <Text style={styles.metricValue}>{data.resumen.roi.toFixed(1)}%</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Eficiencia</Text>
                                <Text style={styles.metricValue}>Alta</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* COSTOS TABLE */}
                {selectedSections.includes('costos') && data.costos ? (
                    <View style={styles.section} break={false}>
                        <Text style={styles.sectionHeader}>Desglose de Costos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={{ ...styles.tableHeaderCell, width: '70%' }}>Categoría</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '30%', textAlign: 'right' }}>Monto</Text>
                            </View>
                            {[
                                ['Insumos Agrícolas', data.costos.insumos],
                                ['Mano de Obra', data.costos.manoObra],
                                ['Maquinaria y Equipos', data.costos.maquinaria],
                                ['Otros Costos', data.costos.otros]
                            ].map(([cat, val]: any, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={{ ...styles.tableCell, width: '70%' }}>{cat}</Text>
                                    <Text style={{ ...styles.tableCell, width: '30%', textAlign: 'right' }}>{formatCurrency(val || 0)}</Text>
                                </View>
                            ))}
                            <View style={styles.totalRow}>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginRight: 10 }}>TOTAL COSTOS:</Text>
                                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{formatCurrency(data.resumen.costoTotal)}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* INSUMOS TABLE */}
                {selectedSections.includes('insumos') && data.insumos?.length > 0 ? (
                    <View style={styles.section} break>
                        <Text style={styles.sectionHeader}>Insumos Utilizados</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={{ ...styles.tableHeaderCell, width: '40%' }}>Insumo</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Categoría</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Cantidad</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%', textAlign: 'right' }}>Total</Text>
                            </View>
                            {data.insumos.map((insumo: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={{ ...styles.tableCell, width: '40%' }}>{insumo.nombre}</Text>
                                    <Text style={{ ...styles.tableCell, width: '20%' }}>{insumo.categoria}</Text>
                                    <Text style={{ ...styles.tableCell, width: '20%' }}>{insumo.cantidad} {insumo.unidad}</Text>
                                    <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{formatCurrency(insumo.total)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* VENTAS TABLE */}
                {selectedSections.includes('ventas') && data.ventas?.length > 0 ? (
                    <View style={styles.section} break>
                        <Text style={styles.sectionHeader}>Registro de Ventas</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Fecha</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '30%' }}>Cliente</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '30%' }}>Producto</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%', textAlign: 'right' }}>Total</Text>
                            </View>
                            {data.ventas.map((venta: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={{ ...styles.tableCell, width: '20%' }}>{new Date(venta.fecha).toLocaleDateString()}</Text>
                                    <Text style={{ ...styles.tableCell, width: '30%' }}>{venta.cliente}</Text>
                                    <Text style={{ ...styles.tableCell, width: '30%' }}>{venta.producto} ({venta.cantidad})</Text>
                                    <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{formatCurrency(venta.total)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* COSECHAS TABLE */}
                {selectedSections.includes('cosechas') && data.cosechas?.length > 0 ? (
                    <View style={styles.section} break>
                        <Text style={styles.sectionHeader}>Lotes de Producción (Cosechas)</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Fecha</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '30%' }}>Producto</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Cantidad/Calidad</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '30%', textAlign: 'right' }}>Costo Total</Text>
                            </View>
                            {data.cosechas.map((cosecha: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={{ ...styles.tableCell, width: '20%' }}>{new Date(cosecha.fecha).toLocaleDateString()}</Text>
                                    <Text style={{ ...styles.tableCell, width: '30%' }}>{cosecha.producto}</Text>
                                    <Text style={{ ...styles.tableCell, width: '20%' }}>{cosecha.cantidad} / {cosecha.calidad}</Text>
                                    <Text style={{ ...styles.tableCell, width: '30%', textAlign: 'right' }}>{formatCurrency(cosecha.costoTotal)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* ACTIVIDADES TABLE */}
                {selectedSections.includes('actividades') && data.actividades?.length > 0 ? (
                    <View style={styles.section} break>
                        <Text style={styles.sectionHeader}>Registro de Actividades Recientes</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={{ ...styles.tableHeaderCell, width: '20%' }}>Fecha</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '50%' }}>Actividad</Text>
                                <Text style={{ ...styles.tableHeaderCell, width: '30%', textAlign: 'right' }}>Costo Mano Obra</Text>
                            </View>
                            {data.actividades.slice(0, 15).map((act: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={{ ...styles.tableCell, width: '20%' }}>{new Date(act.fecha).toLocaleDateString()}</Text>
                                    <Text style={{ ...styles.tableCell, width: '50%' }}>{act.nombre}</Text>
                                    <Text style={{ ...styles.tableCell, width: '30%', textAlign: 'right' }}>{formatCurrency(act.costoManoObra || 0)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* IoT MONITORING */}
                {selectedSections.includes('monitoreo') && iotData ? (
                    <View style={styles.section} break>
                        <Text style={styles.sectionHeader}>Monitoreo IoT (Promedios del Periodo)</Text>
                        <View style={{ ...styles.metricsGrid, marginBottom: 10 }}>
                            {iotData?.temperature ? (
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Temperatura Promedio</Text>
                                    <Text style={styles.metricValue}>{iotData.temperature.avg.toFixed(1)}°C</Text>
                                </View>
                            ) : null}
                            {iotData?.humidity ? (
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Humedad Promedio</Text>
                                    <Text style={styles.metricValue}>{iotData.humidity.avg.toFixed(1)}%</Text>
                                </View>
                            ) : null}
                            {iotData?.soilMoisture ? (
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricLabel}>Humedad Suelo</Text>
                                    <Text style={styles.metricValue}>{iotData.soilMoisture.avg.toFixed(1)}%</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic' }}>
                            Datos basados en sensores instalados en el lote del cultivo.
                        </Text>
                    </View>
                ) : null}

                {/* FOOTER */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Agrotech - Sistema de Gestión Agrícola</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                        `Pág. ${pageNumber} / ${totalPages}`
                    )} />
                </View>
            </Page>
        </Document>
    );
};
