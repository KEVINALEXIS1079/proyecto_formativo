import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { Text, Searchbar, Card, Chip, Button, IconButton, useTheme, Divider, FAB } from 'react-native-paper';
import { Plus, Bug, Sprout, Search, Filter } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { epaAPI } from '../../../shared/services/api';

const FitosanitarioListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [epas, setEpas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Función para convertir hex a RGBA con opacidad
    const hexToRGBA = (hex: string, alpha: number = 1): string => {
        // Si el hex no empieza con #, añadirlo
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        
        // Maneja colores cortos (#666) y largos (#666666)
        let r, g, b;
        
        if (hex.length === 4) {
            // Formato corto: #RGB
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            // Formato largo: #RRGGBB
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else {
            // Color por defecto si el formato es inválido
            console.warn(`Color hexadecimal inválido: ${hex}, usando gris por defecto`);
            return `rgba(102, 102, 102, ${alpha})`;
        }
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const fetchEpas = useCallback(async (query: string = '') => {
        setLoading(true);
        try {
            const params: any = {};
            if (query) params.q = query;

            const response = await epaAPI.list(params);
            const rawData = response.data;
            const data = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);
            setEpas(data);
        } catch (error) {
            console.error('Error fetching EPAs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchEpas(searchQuery);
        }, [fetchEpas])
    );

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchEpas(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchEpas]);

    const getEpaColor = (tipo: string) => {
        const t = tipo?.toLowerCase() || '';
        if (t.includes('enfermedad')) return '#dc2626'; // red
        if (t.includes('plaga')) return '#ea580c'; // orange
        if (t.includes('arvense')) return '#ca8a04'; // yellow
        return '#666666'; // Cambiado de #666 a #666666 para formato consistente
    };

    const renderItem = ({ item }: { item: any }) => {
        const tipoEpa = item.tipoEpa?.nombre || item.tipoEpa?.tipoEpaEnum || 'Desconocido';
        const cultivo = item.tipoCultivoEpa?.nombre || item.cultivo?.nombre || 'General';
        const color = getEpaColor(tipoEpa);
        const imagen = item.fotosGenerales?.[0] || item.imagenesUrls?.[0] || null;

        return (
            <Card style={styles.card} mode="elevated" onPress={() => console.log("Detail", item.id)}>
                <Card.Content style={{ flexDirection: 'row', gap: 16 }}>
                    {imagen ? (
                        <Image source={{ uri: imagen }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.placeholderImage, { backgroundColor: '#f3f4f6' }]}>
                            <Bug size={32} color={color} />
                        </View>
                    )}

                    <View style={{ flex: 1 }}>
                        <View style={styles.cardHeader}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.nombre}</Text>
                            <Chip
                                style={{ 
                                    backgroundColor: hexToRGBA(color, 0.12), // 12% de opacidad
                                    height: 24,
                                    borderWidth: 0
                                }}
                                textStyle={{ 
                                    color: color, 
                                    fontSize: 10, 
                                    lineHeight: 14,
                                    fontWeight: '600'
                                }}
                            >
                                {tipoEpa}
                            </Chip>
                        </View>

                        <Text variant="bodySmall" numberOfLines={2} style={{ color: '#666', marginTop: 4 }}>
                            {item.descripcion}
                        </Text>

                        <View style={styles.cardFooter}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Sprout size={14} color="#166534" />
                                <Text variant="labelSmall" style={{ color: '#166534' }}>{cultivo}</Text>
                            </View>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#1f2937' }}>Fitosanitario</Text>
                    <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Gestión de plagas y enfermedades</Text>
                </View>
            </View>

            <View style={styles.searchSection}>
                <Searchbar
                    placeholder="Buscar EPA..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    elevation={0}
                    style={{ backgroundColor: '#f1f5f9', borderRadius: 12 }}
                    inputStyle={{ minHeight: 40 }}
                />
            </View>

            <FlatList
                data={epas}
                renderItem={renderItem}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchEpas(searchQuery)} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Bug size={48} color="#cbd5e1" />
                            <Text style={{ marginTop: 16, color: '#64748b' }}>No hay registros fitosanitarios</Text>
                        </View>
                    ) : null
                }
            />

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: '#166534' }]}
                color="white"
                onPress={() => navigation.navigate('CreateEpa')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f1f5f9'
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    cardFooter: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default FitosanitarioListScreen;