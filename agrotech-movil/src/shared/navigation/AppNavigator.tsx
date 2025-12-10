import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../../modules/landing/screens/LandingScreen';
import LoginScreen from '../../modules/auth/screens/LoginScreen';
import RegisterScreen from '../../modules/auth/screens/RegisterScreen';
import RecoverPasswordScreen from '../../modules/auth/screens/RecoverPasswordScreen';
import MainNavigator from './MainNavigator';
import ActivityDetailScreen from '../../modules/activities/screens/ActivityDetailScreen';
import { AuthGuard } from '../../modules/auth/ui/AuthGuard';

// Define the parameter list for your stack
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  RecoverPassword: undefined;
  Main: undefined;
  ActivityDetail: { activityId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProtectedMain = () => <AuthGuard><MainNavigator /></AuthGuard>;

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
        />
        <Stack.Screen 
          name="RecoverPassword" 
          component={RecoverPasswordScreen} 
        />
        <Stack.Screen
          name="Main"
          component={ProtectedMain}
        />
        <Stack.Screen 
          name="ActivityDetail" 
          component={ActivityDetailScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
