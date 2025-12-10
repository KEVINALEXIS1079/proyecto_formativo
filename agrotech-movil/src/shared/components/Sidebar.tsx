import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';

const Sidebar: React.FC<DrawerContentComponentProps> = (props) => {

  return (
    <View style={styles.container}>
      {/* Header del Sidebar */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/LogoTic.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      {/* Lista de Navegación */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    paddingTop: 50,
    height: 150,
    justifyContent: 'center',
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  drawerContent: {
    paddingTop: 10,
  },
});

export default Sidebar;
