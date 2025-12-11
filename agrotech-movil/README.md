# 📱 AgroTech Móvil - Aplicación React Native

## 📋 Descripción

Aplicación móvil desarrollada con React Native y Expo que permite a los usuarios gestionar cultivos, monitorear sensores IoT en tiempo real y registrar actividades agrícolas desde dispositivos Android e iOS.

## 🛠️ Stack Tecnológico

- **Framework**: React Native + Expo SDK 49.x
- **Lenguaje**: TypeScript 5.x
- **Navegación**: React Navigation 6.x
- **UI**: React Native Paper
- **State Management**: Context API + TanStack Query
- **HTTP Client**: Axios
- **Formularios**: React Hook Form
- **Iconos**: React Native Vector Icons
- **Cámara**: Expo Image Picker
- **Geolocalización**: Expo Location
- **Notificaciones**: Expo Notifications

## 📦 Prerrequisitos

- **Node.js** 22.x
- **npm** 10.x
- **Expo CLI** (se instalará automáticamente)
- **Backend** corriendo en red local o servidor accesible

### Para desarrollo Android
- **Android Studio** con SDK configurado (API 21+)
- **Java JDK** 11

### Para desarrollo iOS (solo macOS)
- **Xcode** 14
- **CocoaPods** instalado

### Verificar versiones

```bash
node --version  # Debe ser v22.x
npm --version   # Debe ser 10.x
```

## 🚀 Instalación

### 1. Navegar al directorio

```bash
cd proyecto_formativo/agrotech-movil
```

### 2. Instalar dependencias

```bash
npm install
```

**Nota**: La instalación puede tardar varios minutos.

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Copiar plantilla (si existe)
cp .env.example .env
```

Editar `.env`:

```env
# API Backend
# IMPORTANTE: Usar IP de tu computadora, NO localhost
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000

# Configuración de la app
EXPO_PUBLIC_APP_NAME=AgroTech SENA
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**CRÍTICO**: En React Native/Expo, `localhost` NO funciona. Debes usar la IP de tu computadora.

### 4. Obtener IP de tu computadora

#### Windows
```bash
ipconfig
# Buscar "Dirección IPv4" en tu adaptador de red WiFi o Ethernet
# Ejemplo: 192.168.1.100
```

#### macOS
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# O usar: ipconfig getifaddr en0
```

#### Linux
```bash
hostname -I
# O: ip addr show
```

### 5. Configurar firewall (Windows)

Si usas Windows, debes permitir el puerto 4000 en el firewall:

```powershell
# Ejecutar PowerShell como Administrador
New-NetFirewallRule -DisplayName "AgroTech Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

## 🏃 Ejecución

### Iniciar Expo

```bash
# Iniciar servidor de desarrollo
npm start
```

Esto abrirá Expo Dev Tools en tu navegador con un código QR.

### Ejecutar en dispositivo físico (Recomendado)

#### Android

1. Instalar **Expo Go** desde Google Play Store
2. Asegurarte de que el dispositivo esté en la misma red WiFi que tu computadora
3. Escanear el código QR desde la app Expo Go
4. La app se cargará automáticamente

#### iOS

1. Instalar **Expo Go** desde App Store
2. Asegurarte de que el dispositivo esté en la misma red WiFi que tu computadora
3. Escanear el código QR desde la cámara del iPhone
4. Abrir en Expo Go
5. La app se cargará automáticamente

### Ejecutar en emulador

#### Android Emulator

```bash
# Asegurarse de que Android Studio esté instalado y un emulador creado
# Iniciar emulador desde Android Studio o:
npm run android
```

#### iOS Simulator (solo macOS)

```bash
# Requiere Xcode instalado
npm run ios
```

### Otros comandos

```bash
# Ejecutar en web (experimental)
npm run web

# Limpiar caché de Expo
npm start -- --clear

# O
expo start -c

# Ver logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## 🗂️ Estructura del Proyecto

```
agrotech-movil/
├── src/
│   ├── assets/           # Recursos (imágenes, iconos, fuentes)
│   ├── components/       # Componentes reutilizables
│   ├── constants/        # Constantes de la aplicación
│   ├── context/          # Context providers (Auth, Theme, etc.)
│   ├── modules/          # Módulos de la aplicación
│   │   ├── auth/         # Autenticación (Login, Register)
│   │   ├── home/         # Dashboard principal
│   │   ├── cultivos/     # Gestión de cultivos
│   │   ├── iot/          # Monitoreo IoT
│   │   ├── activities/   # Registro de actividades
│   │   └── profile/      # Perfil de usuario
│   ├── shared/           # Utilidades compartidas
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilidades
│   └── utils/            # Funciones auxiliares
├── assets/               # Assets globales (splash, icon)
├── .env                  # Variables de entorno (NO subir a git)
├── .env.example          # Plantilla de .env
├── App.tsx               # Componente raíz
├── app.json              # Configuración Expo
├── babel.config.js       # Configuración Babel
├── index.js              # Punto de entrada
├── metro.config.js       # Configuración Metro bundler
├── package.json          # Dependencias y scripts
└── README.md             # Este archivo
```

## 🔑 Credenciales por Defecto

```
Email: agrotechsena2025@gmail.com
Password: Agrotech2025
```

## 📱 Pantallas Principales

### 1. Autenticación
- **Login**: Inicio de sesión con email y contraseña
- **Registro**: Crear nueva cuenta
- **Recuperar contraseña**: Envío de email de recuperación

### 2. Dashboard (Home)
- Resumen de cultivos activos
- Estadísticas rápidas (ventas, costos, sensores)
- Accesos directos a funcionalidades
- Notificaciones y alertas IoT

### 3. Cultivos
- Lista de cultivos con búsqueda y filtros
- Detalles de cultivo con toda la información
- Crear/Editar cultivo con formularios validados
- Mapa de ubicación del cultivo
- Historial de actividades

### 4. Monitoreo IoT
- Dashboard de sensores en tiempo real
- Gráficas de tendencias
- Alertas activas con notificaciones push
- Historial de lecturas
- Configuración de umbrales

### 5. Actividades
- Registro rápido de actividades
- Lista de actividades con filtros
- Calendario de tareas
- Captura de fotos como evidencia
- Asignación de recursos

### 6. Perfil
- Información de usuario
- Configuración de la app
- Notificaciones
- Cerrar sesión

## 🎨 Personalización

### Tema

Editar `src/theme/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#22c55e',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#000000',
    error: '#ef4444',
    success: '#22c55e',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  }
};
```

### Iconos

```tsx
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

<Icon name="leaf" size={24} color="#22c55e" />
```

## 🔐 Autenticación

### Login

```tsx
import { useAuth } from '../context/AuthContext';

function LoginScreen() {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navegación automática al Home
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  // ...
}
```

### Navegación Protegida

```tsx
import { useAuth } from '../context/AuthContext';

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}
```

## 📊 Gestión de Estado

### Context API

```tsx
import { createContext, useContext, useState } from 'react';

const CultivosContext = createContext();

export function CultivosProvider({ children }) {
  const [cultivos, setCultivos] = useState([]);

  const fetchCultivos = async () => {
    const data = await api.getCultivos();
    setCultivos(data);
  };

  return (
    <CultivosContext.Provider value={{ cultivos, fetchCultivos }}>
      {children}
    </CultivosContext.Provider>
  );
}

export const useCultivos = () => useContext(CultivosContext);
```

## 📸 Cámara y Permisos

### Solicitar permisos

```tsx
import * as ImagePicker from 'expo-image-picker';

const requestPermissions = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permisos', 'Se necesitan permisos de cámara');
  }
};
```

### Tomar foto

```tsx
const takePhoto = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (!result.canceled) {
    setPhoto(result.assets[0].uri);
  }
};
```

## 🗺️ Geolocalización

```tsx
import * as Location from 'expo-location';

const getLocation = async () => {
  // Solicitar permisos
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status === 'granted') {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    console.log('Lat:', location.coords.latitude);
    console.log('Lng:', location.coords.longitude);
  }
};
```

## 🔔 Notificaciones Push

```tsx
import * as Notifications from 'expo-notifications';

// Configurar handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Enviar notificación local
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Alerta IoT',
    body: 'Temperatura alta detectada en Lote 1',
    data: { loteId: 1 },
  },
  trigger: null, // Inmediata
});
```

## 📦 Build para Producción

### Android APK (Desarrollo)

```bash
# Build APK para instalar en dispositivos
expo build:android -t apk
```

### Android AAB (Play Store)

```bash
# Build AAB para publicar en Google Play
expo build:android -t app-bundle
```

### iOS IPA (solo macOS)

```bash
# Build para App Store
expo build:ios
```

### EAS Build (Recomendado - Servicio en la nube)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# Build ambos
eas build --platform all
```

## 🐛 Debugging

### React Native Debugger

1. Instalar [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Iniciar la app
3. Abrir menú de desarrollo:
   - Android: Shake device o `Ctrl+M`
   - iOS: Shake device o `Cmd+D`
4. Seleccionar "Debug Remote JS"

### Flipper (Recomendado)

1. Instalar [Flipper](https://fbflipper.com/)
2. Iniciar Flipper
3. Iniciar la app
4. La app se conectará automáticamente

### Logs en tiempo real

```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios

# Expo
expo start
# Presionar 'j' para abrir debugger
```

## 🚨 Solución de Problemas

### Error de conexión al backend

```bash
# 1. Verificar que el backend esté corriendo
curl http://192.168.1.100:4000/api/health

# 2. Verificar que estés en la misma red WiFi

# 3. Verificar firewall (Windows)
# Permitir puerto 4000 en firewall

# 4. Verificar variable de entorno
echo $EXPO_PUBLIC_API_URL
```

### Metro Bundler no inicia

```bash
# Limpiar caché
npm start -- --clear

# O
expo start -c

# Limpiar completamente
rm -rf node_modules
npm install
expo start -c
```

### Error "Unable to resolve module"

```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install

# Limpiar watchman (macOS/Linux)
watchman watch-del-all

# Reiniciar Metro
expo start -c
```

### Problemas con Android

```bash
# Limpiar build de Android
cd android
./gradlew clean
cd ..

# Reinstalar
rm -rf android node_modules
npm install
```

### App no se conecta a Expo Go

1. Verificar que estés en la misma red WiFi
2. Desactivar VPN si está activa
3. Reiniciar Expo Dev Server
4. Reiniciar dispositivo

## 📱 Publicación

### Google Play Store

1. **Crear cuenta de desarrollador** ($25 único pago)
2. **Generar AAB**:
   ```bash
   eas build --platform android
   ```
3. **Subir a Play Console**
4. **Completar información**:
   - Descripción de la app
   - Screenshots
   - Icono
   - Política de privacidad
5. **Enviar para revisión**

### Apple App Store

1. **Crear cuenta de desarrollador** ($99/año)
2. **Generar IPA**:
   ```bash
   eas build --platform ios
   ```
3. **Subir a App Store Connect**
4. **Completar información**:
   - Descripción
   - Screenshots
   - Icono
   - Política de privacidad
5. **Enviar para revisión**

## 🔄 Actualización

```bash
# Actualizar Expo SDK
expo upgrade

# Actualizar dependencias
npm update

# Verificar dependencias obsoletas
npm outdated

# Actualizar React Native
npm install react-native@latest
```

## 📝 Convenciones de Código

- **Componentes**: PascalCase (ej: `LoginScreen.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useAuth.ts`)
- **Utilidades**: camelCase (ej: `formatDate.ts`)
- **Estilos**: camelCase (ej: `container`, `buttonText`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `API_URL`)

## 📞 Soporte

Para problemas o consultas:
- **Email**: agrotechsena2025@gmail.com
- **Expo Forums**: https://forums.expo.dev/
- **React Native Docs**: https://reactnative.dev/

---

**Desarrollado con ❤️ por el equipo AgroTech SENA**
