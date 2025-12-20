import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from "date-fns";
import type { Venta } from "../../api/production.service";

// Receipt standard width ~80mm = ~227pt
const RECEIPT_WIDTH = 227;

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        padding: 10,
        width: RECEIPT_WIDTH,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 5,
    },
    logo: {
        width: 60, // Large relative to receipt width
        height: 60,
        objectFit: 'contain',
    },
    titleContainer: {
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    subTitle: {
        fontSize: 8,
        color: '#444',
    },
    metaSection: {
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    label: {
        fontSize: 8,
        color: '#666',
    },
    value: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    table: {
        width: '100%',
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        paddingBottom: 2,
        marginBottom: 4,
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    // Columns: Item (45%), Qty (15%), Price (20%), Total (20%)
    colItem: { width: '45%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    itemName: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
    itemSub: { fontSize: 7, color: '#666' },

    totalsSection: {
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    totalLabel: {
        fontSize: 9,
    },
    totalValue: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
    },
    grandTotal: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginTop: 4,
    },
    footer: {
        marginTop: 15,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#888',
        marginBottom: 2,
    },
});

interface PosReceiptPDFProps {
    venta: Venta;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val);

export const PosReceiptPDF = ({ venta }: PosReceiptPDFProps) => {
    return (
        <Document>
            {/* Custom page size for receipt: 80mm width, auto height approximated by long length */}
            <Page size={[RECEIPT_WIDTH, 600]} style={styles.page}>
                {/* Header with Logo Left, Title Right */}
                <View style={styles.header}>
                    <Image src="/logoAgrotech.png" style={styles.logo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>RECIBO DE CAJA</Text>
                        <Text style={styles.subTitle}>Agrotech Ltda.</Text>
                        <Text style={styles.subTitle}>NIT: 900.000.000-1</Text>
                    </View>
                </View>

                {/* Meta Info */}
                <View style={styles.metaSection}>
                    <View style={styles.metaRow}>
                        <Text style={styles.label}>N° Venta:</Text>
                        <Text style={styles.value}>#{String(venta.id).padStart(6, '0')}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{format(new Date(venta.fecha), "dd/MM/yyyy HH:mm")}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{venta.cliente?.nombre || "Consumidor Final"}</Text>
                    </View>
                    {venta.cliente?.identificacion && (
                        <View style={styles.metaRow}>
                            <Text style={styles.label}>ID/NIT:</Text>
                            <Text style={styles.value}>{venta.cliente.identificacion}</Text>
                        </View>
                    )}
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colItem, { fontSize: 8, fontFamily: 'Helvetica-Bold' }]}>Detalle</Text>
                        <Text style={[styles.colQty, { fontSize: 8, fontFamily: 'Helvetica-Bold' }]}>Can</Text>
                        <Text style={[styles.colPrice, { fontSize: 8, fontFamily: 'Helvetica-Bold' }]}>Und</Text>
                        <Text style={[styles.colTotal, { fontSize: 8, fontFamily: 'Helvetica-Bold' }]}>Total</Text>
                    </View>

                    {venta.detalles.map((detalle: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.colItem}>
                                <Text style={styles.itemName}>
                                    {detalle.loteProduccion?.productoAgro?.nombre || "Producto"}
                                </Text>
                                <Text style={styles.itemSub}>
                                    Lote: {detalle.loteProduccion?.codigoLote || detalle.loteProduccionId}
                                </Text>
                            </View>
                            <Text style={styles.colQty}>{detalle.cantidadKg}</Text>
                            <Text style={styles.colPrice}>
                                {formatCurrency(detalle.precioUnitarioKg ?? 0).replace('$ ', '')}
                            </Text>
                            <Text style={styles.colTotal}>
                                {formatCurrency(detalle.subtotal ?? 0).replace('$ ', '')}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(venta.subtotal)}</Text>
                    </View>
                    {venta.impuestos > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA</Text>
                            <Text style={styles.totalValue}>{formatCurrency(venta.impuestos)}</Text>
                        </View>
                    )}
                    <View style={{ ...styles.totalRow, marginTop: 4 }}>
                        <Text style={styles.grandTotal}>TOTAL</Text>
                        <Text style={styles.grandTotal}>{formatCurrency(venta.total)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>¡Gracias por su compra!</Text>
                    <Text style={styles.footerText}>Software: Agrotech POS System</Text>
                </View>
            </Page>
        </Document>
    );
};
