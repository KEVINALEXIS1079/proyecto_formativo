import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert, Text, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Bell, User, LogOut, Home, ListChecks, Map, Sprout, Leaf, Cpu, Wallet, Box, FileBarChart, Users } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAuth } from '../../modules/auth/context/AuthContext';
import HomeScreen from '../../modules/home/screens/HomeScreen';
import ActivitiesListScreen from '../../modules/activities/screens/ActivitiesListScreen';
import UsersListScreen from '../../modules/users/screens/UsersListScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import GeoListScreen from '../../modules/geo/screens/GeoListScreen';
import CropsListScreen from '../../modules/crops/screens/CropsListScreen';
import InventoryListScreen from '../../modules/inventory/screens/InventoryListScreen';
import Sidebar from '../components/Sidebar';

// Define the parameter list for the drawer
export type MainDrawerParamList = {
  Home: undefined;
  Activities: undefined;
  Geo: undefined;
  Crops: undefined;
  Wiki: undefined;
  IoT: undefined;
  Finanzas: undefined;
  Inventory: undefined;
  Reports: undefined;
  Users: undefined;
};

const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Placeholder component for missing modules
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Image source={require('../../assets/images/LogoTic.png')} style={{ width: 100, height: 100, marginBottom: 20 }} resizeMode="contain" />
    <View style={{ padding: 20 }}>
      <View style={{ marginBottom: 10 }}><Bell size={40} color="#166534" /></View>
    </View>
    <View><Image source={require('../../assets/images/LogoTic.png')} style={{ width: 200, height: 50 }} resizeMode="contain" /></View>
  </View>
);

const ReportsScreen = () => <PlaceholderScreen name="Reportes" />;

const MainNavigator: React.FC = () => {
  const navigation = useNavigation<any>();
  const auth = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    setModalVisible(false);
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={({ navigation: drawerNavigation }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTintColor: '#166534',
          drawerActiveTintColor: '#166534',
          drawerInactiveTintColor: '#333',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color="#166534" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={() => setModalVisible(true)}>
                <Image 
                  source={require('../../assets/images/SeñoraLogin.jpeg')} 
                  style={styles.headerAvatar} 
                />
              </TouchableOpacity>
            </View>
          ),
        })}
      >
        <Drawer.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Inicio',
            drawerIcon: ({ color, size }) => <Home size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="Activities" 
          component={ActivitiesListScreen} 
          options={{ 
            title: 'Actividades',
            drawerIcon: ({ color, size }) => <ListChecks size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="Geo" 
          component={GeoListScreen} 
          options={{ 
            title: 'Georreferenciación',
            drawerIcon: ({ color, size }) => <Map size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="Crops" 
          component={CropsListScreen} 
          options={{ 
            title: 'Cultivos',
            drawerIcon: ({ color, size }) => <Sprout size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="Wiki" 
          component={() => <PlaceholderScreen name="Wiki Fitosanitaria" />} 
          options={{ 
            title: 'Fitosanitario',
            drawerIcon: ({ color, size }) => <Leaf size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="IoT" 
          component={() => <PlaceholderScreen name="IoT" />} 
          options={{ 
            title: 'IoT',
            drawerIcon: ({ color, size }) => <Cpu size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="Finanzas" 
          component={() => <PlaceholderScreen name="Finanzas" />} 
          options={{ 
            title: 'Finanzas',
            drawerIcon: ({ color, size }) => <Wallet size={size} color={color} />
          }} 
        />
        <Drawer.Screen 
          name="Inventory" 
          component={InventoryListScreen} 
          options={{ 
            title: 'Inventario',
            drawerIcon: ({ color, size }) => <Box size={size} color={color} />
          }} 
        />
        <Drawer.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Reportes',
            drawerIcon: ({ color, size }) => <FileBarChart size={size} color={color} />
          }}
        />
        <Drawer.Screen 
          name="Users" 
          component={UsersListScreen} 
          options={{ 
            title: 'Usuarios',
            drawerIcon: ({ color, size }) => <Users size={size} color={color} />
          }} 
        />
      </Drawer.Navigator>

      {/* Profile Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                setTimeout(() => navigation.navigate('Profile'), 100);
              }}
            >
              <User size={20} color="#333" />
              <Text style={styles.modalText}>Mi Perfil</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
              <LogOut size={20} color="#ef4444" />
              <Text style={[styles.modalText, styles.logoutText]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
    gap: 15,
  },
  iconButton: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profileButton: {
    padding: 2,
    borderWidth: 1,
    borderColor: '#dcfce7',
    borderRadius: 20,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 10,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    width: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1001,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
});

export default MainNavigator;
