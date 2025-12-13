import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Sprout,
  Thermometer,
  Droplets,
  Sun,
  MapPin
} from 'lucide-react-native';
import { cropsAPI, activitiesAPI } from '../../../shared/services/api';
import { Cultivo } from '../../../shared/types';

const { width } = Dimensions.get('window');

// Mock data for initial render if API fails or is empty
const MOCK_SENSORS = [
  { id: 1, type: 'Temperatura', value: '24°C', icon: Thermometer, color: '#ef4444', status: 'Normal' },
  { id: 2, type: 'Humedad', value: '65%', icon: Droplets, color: '#3b82f6', status: 'Optimo' },
  { id: 3, type: 'Temperatura Ambiente', value: '25°C', icon: Sun, color: '#a8a29e', status: 'Normal' }
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch crops
      const cropsRes = await cropsAPI.getAll();
      const cropsData = cropsRes.data;
      const normalizedCrops = Array.isArray(cropsData) ? cropsData : (cropsData?.data || cropsData?.items || []);
      if (Array.isArray(normalizedCrops)) {
        setCultivos(normalizedCrops.slice(0, 5)); // Top 5
      }

      // Fetch recent activities
      const actRes = await activitiesAPI.getAll({ limit: 5 });
      const actData = actRes.data;
      const normalizedActivities = Array.isArray(actData) ? actData : (actData?.data || actData?.items || []);

      setActivities(normalizedActivities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const renderCropsCarousel = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Mis Cultivos</Text>
        <Button mode="text" onPress={() => navigation.navigate('Crops')}>Ver todo</Button>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator animating={true} />
        ) : cultivos.length > 0 ? (
          cultivos.map((crop) => (
            <Card key={crop.id} style={styles.cropCard}>
              <View style={styles.cropCardContent}>
                <View style={[styles.cropIconObj, { backgroundColor: '#e8f5e9' }]}>
                  <Sprout size={32} color="#2e7d32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" numberOfLines={1}>{crop.nombreCultivo || crop.nombre}</Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>
                    {typeof crop.tipoCultivo === 'object' ? crop.tipoCultivo.nombre : (crop.tipoCultivo || 'General')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MapPin size={12} color="#666" />
                    <Text variant="labelSmall" style={{ marginLeft: 4, color: '#666' }}>
                      {crop.lote?.nombre || 'Sin lote'}
                    </Text>
                  </View>
                </View>
                <Chip icon="check" style={{ height: 28 }} textStyle={{ fontSize: 10 }}>Activo</Chip>
              </View>
            </Card>
          ))
        ) : (
          <Text style={{ marginLeft: 8, color: '#888' }}>No hay cultivos registrados.</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderSensorsObj = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Monitoreo IoT</Text>
        <Button mode="text" onPress={() => navigation.navigate('IoT')}>Panel IoT</Button>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {MOCK_SENSORS.map((sensor) => (
          <Card key={sensor.id} style={styles.sensorCard}>
            <Card.Content style={{ alignItems: 'center' }}>
              <sensor.icon size={28} color={sensor.color} />
              <Text variant="displaySmall" style={{ marginTop: 8, fontWeight: 'bold' }}>{sensor.value}</Text>
              <Text variant="bodySmall" style={{ color: '#666' }}>{sensor.type}</Text>
              <View style={{ marginTop: 7, backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                <Text variant="labelSmall" style={{ color: '#4b5563' }}>{sensor.status}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecentActivities = () => (
    <View style={[styles.section, { marginBottom: 24 }]}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Actividades Recientes</Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator />
        ) : activities.length > 0 ? (
          activities.map((act) => (
            <Card key={act.id} style={{ marginBottom: 12 }} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium">{act.tipo || 'Actividad'}</Text>
                <Text variant="bodyMedium" style={{ color: '#666', marginTop: 4 }}>
                  {new Date(act.fecha).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 10 }}>No hay actividades recientes.</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerContainer} />

        <View style={styles.contentContainer}>
          {renderCropsCarousel()}
          {renderSensorsObj()}
          {renderRecentActivities()}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10b981',
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#10b981',
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  contentContainer: {
    marginTop: -30,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cropCard: {
    width: width * 0.75,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  cropCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cropIconObj: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensorCard: {
    width: width * 0.28,
    marginRight: 12,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;