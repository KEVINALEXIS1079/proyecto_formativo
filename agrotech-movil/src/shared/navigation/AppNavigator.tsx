import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../../modules/landing/screens/LandingScreen';
import LoginScreen from '../../modules/auth/screens/LoginScreen';
import RegisterScreen from '../../modules/auth/screens/RegisterScreen';
import RecoverPasswordScreen from '../../modules/auth/screens/RecoverPasswordScreen';
import ResetPasswordScreen from '../../modules/auth/screens/ResetPasswordScreen';
import MainNavigator from './MainNavigator';
import ActivityDetailScreen from '../../modules/activities/screens/ActivityDetailScreen';
import CreateCropScreen from '../../modules/crops/screens/CreateCropScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import CreateEpaScreen from '../../modules/fitosanitario/screens/CreateEpaScreen';
import VerifyCodeScreen from '../../modules/auth/screens/VerifyCodeScreen';
import { AuthGuard } from '../../modules/auth/ui/AuthGuard';

// Define the parameter list for your stack
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  RecoverPassword: undefined;
  VerifyCode: { email: string; type?: string; code?: string };
  ResetPassword: { email: string; code: string };
  Main: undefined;
  ActivityDetail: { activityId: number };
  CreateCrop: undefined;
  Profile: undefined;
  CreateEpa: undefined;
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
          name="VerifyCode"
          component={VerifyCodeScreen}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
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
        <Stack.Screen
          name="CreateCrop"
          component={CreateCropScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateEpa"
          component={CreateEpaScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator >
    </NavigationContainer >
  );
};

export default AppNavigator;
