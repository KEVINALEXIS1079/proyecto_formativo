import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Lote, SubLote } from '../../../shared/types';

interface MapComponentProps {
  data: (Lote | SubLote)[];
  style?: ViewStyle;
}

const MapComponent: React.FC<MapComponentProps> = ({ data, style }) => {
  return (
    <MapView
      style={[styles.map, style]}
      initialRegion={{
        latitude: 4.6097, // Colombia
        longitude: -74.0817,
        latitudeDelta: 10,
        longitudeDelta: 10,
      }}
    >
      {data.map((item) => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: 4.6097 + Math.random() * 2 - 1, // Simular coordenadas
            longitude: -74.0817 + Math.random() * 2 - 1,
          }}
          title={item.nombre}
          description={'area' in item ? `${item.area} Ha` : ''}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapComponent;
