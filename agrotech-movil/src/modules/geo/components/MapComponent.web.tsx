import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Lote, SubLote } from '../../../shared/types';

interface MapComponentProps {
  data: (Lote | SubLote)[];
  style?: ViewStyle;
}

const MapComponent: React.FC<MapComponentProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>El mapa no está disponible en la plataforma web.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  text: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default MapComponent;
