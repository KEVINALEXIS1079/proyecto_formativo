import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Activity, Wifi, WifiOff, MapPin } from 'lucide-react-native';

interface SummaryCardProps {
    title: string;
    value: number | string;
    icon: string;
    color?: "success" | "danger" | "default";
    info?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color = "default", info }) => {
    const getColors = () => {
        switch (color) {
            case 'success': return { icon: '#059669', bg: '#ECFDF5', border: '#D1FAE5' };
            case 'danger': return { icon: '#E11D48', bg: '#FFF1F2', border: '#FFE4E6' };
            default: return { icon: '#1F2937', bg: '#F9FAFB', border: '#F3F4F6' };
        }
    };

    const { icon: iconColor, bg, border } = getColors();

    const renderIcon = () => {
        switch (icon) {
            case 'wifi': return <Wifi size={20} color={iconColor} />;
            case 'wifi-off': return <WifiOff size={20} color={iconColor} />;
            case 'map': return <MapPin size={20} color={iconColor} />;
            default: return <Activity size={20} color={iconColor} />;
        }
    };

    return (
        <Card style={[styles.card, { borderColor: border }]}>
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                        {renderIcon()}
                    </View>
                </View>
                <View style={styles.valueContainer}>
                    <Text style={styles.value}>{value}</Text>
                    {info && <Text style={styles.info}>{info}</Text>}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 12,
        elevation: 2,
        flex: 1,
        minWidth: '45%',
        margin: 4
    },
    cardContent: {
        padding: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    title: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flex: 1,
        marginRight: 8
    },
    iconContainer: {
        padding: 6,
        borderRadius: 8
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827'
    },
    info: {
        fontSize: 12,
        color: '#9CA3AF'
    }
});
