import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Search, Layers, Play, LayoutGrid } from 'lucide-react-native';

interface IoTFiltersProps {
    selectedLoteId: number | null;
    setSelectedLoteId: (id: number | null) => void;
    selectedSubLoteId: number | null;
    setSelectedSubLoteId: (id: number | null) => void;
    lotes: any[];
    subLotes: any[];
    isAutoMode?: boolean;
}

export const IoTFilters: React.FC<IoTFiltersProps> = ({
    selectedLoteId,
    setSelectedLoteId,
    selectedSubLoteId,
    setSelectedSubLoteId,
    lotes,
    subLotes,
    isAutoMode = false
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLotes = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return lotes
            .filter(l => l.nombre.toLowerCase().includes(lowerTerm) || (l.ubicacion && l.ubicacion.toLowerCase().includes(lowerTerm)))
            .slice(0, 10);
    }, [lotes, searchTerm]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MapPin size={20} color="#059669" />
                    <Text style={styles.sectionTitle}>Lotes ({filteredLotes.length})</Text>
                    {isAutoMode && (
                        <View style={styles.autoBadge}>
                            <Play size={10} color="#2563EB" fill="#2563EB" />
                            <Text style={styles.autoText}>AUTO</Text>
                        </View>
                    )}
                </View>

                <View style={styles.searchContainer}>
                    <Search size={16} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lotesScroll}>
                {/* General View Option */}
                <TouchableOpacity
                    onPress={() => setSelectedLoteId(null)}
                    style={[
                        styles.loteCard,
                        !selectedLoteId ? styles.selectedLoteCard : styles.unselectedLoteCard,
                        { borderColor: !selectedLoteId ? '#10B981' : '#E5E7EB' }
                    ]}
                >
                    <LayoutGrid size={24} color={!selectedLoteId ? '#059669' : '#9CA3AF'} />
                    <Text style={[styles.loteName, !selectedLoteId && styles.selectedText]}>General</Text>
                </TouchableOpacity>

                {filteredLotes.map((lote) => (
                    <TouchableOpacity
                        key={lote.id}
                        onPress={() => setSelectedLoteId(lote.id)}
                        style={[
                            styles.loteCard,
                            selectedLoteId === lote.id ? styles.selectedLoteCard : styles.unselectedLoteCard,
                            { borderColor: selectedLoteId === lote.id ? '#3B82F6' : '#E5E7EB' }
                        ]}
                    >
                        <View style={[styles.iconBox, selectedLoteId === lote.id ? styles.iconBoxSelected : styles.iconBoxUnselected]}>
                            <MapPin size={20} color={selectedLoteId === lote.id ? '#2563EB' : '#9CA3AF'} />
                        </View>
                        <View>
                            <Text style={[styles.loteName, selectedLoteId === lote.id && styles.selectedText]} numberOfLines={1}>{lote.nombre}</Text>
                            <Text style={styles.loteLocation} numberOfLines={1}>{lote.ubicacion || 'Sin ubicación'}</Text>
                        </View>
                        {isAutoMode && selectedLoteId === lote.id && (
                            <View style={styles.activeDot} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedLoteId && subLotes.length > 0 && (
                <View style={styles.subLotesContainer}>
                    <View style={styles.subLotesHeader}>
                        <Layers size={16} color="#6B7280" />
                        <Text style={styles.subLoteLabel}>Sublotes:</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            onPress={() => setSelectedSubLoteId(null)}
                            style={[styles.subLoteBadge, !selectedSubLoteId ? styles.subLoteActive : styles.subLoteInactive]}
                        >
                            <Text style={!selectedSubLoteId ? styles.subTextActive : styles.subTextInactive}>Todos</Text>
                        </TouchableOpacity>
                        {subLotes.map((sub: any) => (
                            <TouchableOpacity
                                key={sub.id}
                                onPress={() => setSelectedSubLoteId(sub.id)}
                                style={[styles.subLoteBadge, selectedSubLoteId === sub.id ? styles.subLoteActive : styles.subLoteInactive]}
                            >
                                <Text style={selectedSubLoteId === sub.id ? styles.subTextActive : styles.subTextInactive}>{sub.nombre}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 12
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    autoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 4
    },
    autoText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2563EB'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 36,
        width: 140
    },
    searchInput: {
        flex: 1,
        fontSize: 12,
        marginLeft: 4,
        padding: 0
    },
    lotesScroll: {
        paddingHorizontal: 4,
        paddingBottom: 4,
        gap: 12
    },
    loteCard: {
        width: 180,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        elevation: 1
    },
    selectedLoteCard: {
        backgroundColor: 'white',
    },
    unselectedLoteCard: {
        backgroundColor: '#F9FAFB',
    },
    iconBox: {
        padding: 8,
        borderRadius: 20,
    },
    iconBoxSelected: {
        backgroundColor: '#EFF6FF',
    },
    iconBoxUnselected: {
        backgroundColor: '#F3F4F6',
    },
    loteName: {
        fontWeight: '600',
        color: '#4B5563',
        fontSize: 14
    },
    selectedText: {
        color: '#111827',
        fontWeight: 'bold'
    },
    loteLocation: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2
    },
    activeDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6'
    },
    subLotesContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginHorizontal: 4
    },
    subLotesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4
    },
    subLoteLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500'
    },
    subLoteBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1
    },
    subLoteActive: {
        backgroundColor: '#1F2937',
        borderColor: '#1F2937'
    },
    subLoteInactive: {
        backgroundColor: 'white',
        borderColor: '#E5E7EB'
    },
    subTextActive: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500'
    },
    subTextInactive: {
        color: '#6B7280',
        fontSize: 12
    }
});
