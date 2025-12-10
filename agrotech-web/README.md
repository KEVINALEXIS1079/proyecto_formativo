# 🌐 AgroTech Web - Aplicación Frontend

## 📋 Descripción

Aplicación web desarrollada con React y Vite que proporciona una interfaz moderna y responsiva para la gestión completa del sistema AgroTech. Incluye dashboard, gestión de cultivos, monitoreo IoT en tiempo real, generación de reportes profesionales y más.

## 🛠️ Stack Tecnológico

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.1.2
- **Lenguaje**: TypeScript 5.8.3
- **UI Library**: HeroUI 2.8.5 (NextUI fork)
- **Routing**: React Router DOM 7.9.1
- **State Management**: TanStack Query 5.90.2 (React Query)
- **HTTP Client**: Axios 1.12.2
- **Gráficas**: Recharts 3.3.0
- **Mapas**: Leaflet 1.9.4 + React Leaflet 5.0.0
- **Exportación**: jsPDF 3.0.4, jsPDF-AutoTable 5.0.2, XLSX 0.18.5
- **Formularios**: React Hook Form 7.67.0 + Zod 4.1.8
- **Iconos**: Lucide React 0.544.0
- **WebSockets**: Socket.IO Client 4.8.1
- **Estilos**: Tailwind CSS 4.1.13
- **Puerto**: 3000

## 📦 Prerrequisitos

- **Node.js** 18.x
- **npm** 9.x
- **Backend** corriendo en http://localhost:4000

### Verificar versiones

```bash
node --version  # Debe ser v18.x
npm --version   # Debe ser 9.x
```

## 🚀 Instalación

### 1. Navegar al directorio

```bash
cd proyecto_formativo/agrotech-web
```

### 2. Instalar dependencias

```bash
npm install
```

**Nota**: La instalación puede tardar varios minutos debido a las dependencias de Leaflet, Recharts y otras librerías.

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Copiar plantilla (si existe)
cp .env.example .env
```

Editar `.env`:

```env
# API Backend
VITE_API_URL=http://localhost:4000

# Configuración de la app
VITE_APP_NAME=AgroTech SENA
VITE_APP_VERSION=1.0.0

# Mapas (opcional - para tiles de mapas)
VITE_MAPBOX_TOKEN=tu_token_mapbox_opcional

# Google Maps (opcional)
VITE_GOOGLE_MAPS_KEY=tu_api_key_google_opcional
```

**IMPORTANTE**: Las variables de entorno en Vite deben tener el prefijo `VITE_` para ser accesibles en el código.

## 🏃 Ejecución

### Modo Desarrollo

```bash
# Iniciar servidor de desarrollo con hot reload
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

El servidor de desarrollo incluye:
- Hot Module Replacement (HMR)
- Recarga automática al guardar cambios
- Source maps para debugging
- Mensajes de error detallados

### Modo Producción

```bash
# Compilar para producción
npm run build

# Previsualizar build de producción localmente
npm run preview
```

El build de producción:
- Minifica el código
- Optimiza assets
- Genera source maps
- Output en carpeta `/dist`

### Otros comandos

```bash
# Linter (revisar código)
npm run lint

# Type checking (verificar tipos TypeScript)
tsc --noEmit

# Limpiar caché de Vite
rm -rf node_modules/.vite
```

## 🗂️ Estructura del Proyecto

```
agrotech-web/
├── public/                # Archivos estáticos
│   ├── LogoTic.png       # Logo de la aplicación
│   └── favicon.ico       # Favicon
├── src/
│   ├── app/              # Configuración de la aplicación
│   ├── assets/           # Recursos (imágenes, iconos)
│   ├── lib/              # Librerías y configuraciones
│   ├── modules/          # Módulos de la aplicación
│   │   ├── actividad/    # Registro de actividades agrícolas
│   │   ├── auth/         # Autenticación (login, register, guards)
│   │   ├── comercial/    # Gestión comercial y ventas
│   │   ├── cultivos/     # Gestión de cultivos y lotes
│   │   ├── fitosanitario/# Control fitosanitario
│   │   ├── geo/          # Servicios geoespaciales y mapas
│   │   ├── home/         # Dashboard principal
│   │   ├── inventario/   # Gestión de inventario e insumos
│   │   ├── iot/          # Monitoreo IoT en tiempo real
│   │   ├── landing/      # Página de inicio
│   │   ├── profile/      # Perfil de usuario
│   │   ├── reportes/     # Generación de reportes (PDF/Excel/CSV)
│   │   └── users/        # Gestión de usuarios (admin)
│   ├── shared/           # Componentes compartidos
│   │   ├── components/   # Componentes reutilizables
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utilidades
│   │   └── types/        # Tipos TypeScript globales
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── .env                  # Variables de entorno (NO subir a git)
├── .env.example          # Plantilla de .env
├── vite.config.ts        # Configuración Vite
├── tsconfig.json         # Configuración TypeScript
├── tailwind.config.js    # Configuración Tailwind CSS
├── package.json          # Dependencias y scripts
└── README.md             # Este archivo
```

## 🔑 Credenciales por Defecto

```
Email: agrotechsena2025@gmail.com
Password: Agrotech2025
```

## 📱 Módulos Principales

### 1. Dashboard
- Vista general del sistema con KPIs
- Estadísticas en tiempo real
- Gráficas de resumen (cultivos, ventas, IoT)
- Accesos rápidos a funcionalidades
- Notificaciones y alertas

### 2. Cultivos
- Lista de cultivos con filtros y búsqueda
- Crear/Editar cultivos con formularios validados
- Vista de detalles con información completa
- Mapa de ubicación con Leaflet
- Gestión de lotes y sublotes
- Historial de actividades por cultivo

### 3. Monitoreo IoT
- Dashboard de sensores en tiempo real (WebSockets)
- Gráficas de tendencias con Recharts
- Alertas activas y configuración de umbrales
- Filtros por lote, sensor y rango de fechas
- Exportación de datos históricos
- Visualización de ubicación de sensores en mapa

### 4. Reportes
- Reportes financieros completos
- Reportes de producción y cosechas
- Exportación a PDF con diseño profesional
- Exportación a Excel y CSV
- Vista previa personalizable
- Selección de secciones a incluir
- Gráficas y tarjetas visuales en PDF

### 5. Actividades
- Registro de actividades agrícolas
- Calendario de tareas
- Asignación de recursos
- Seguimiento de progreso
- Filtros por tipo y fecha

### 6. Ventas
- Registro de ventas y productos
- Gestión de clientes
- Generación de facturas
- Estadísticas de ventas
- Historial de transacciones

## 🎨 Temas y Personalización

### Cambiar tema

La aplicación usa HeroUI que soporta temas claro y oscuro:

```tsx
import { ThemeProvider } from '@heroui/react';

<ThemeProvider defaultTheme="dark">
  <App />
</ThemeProvider>
```

### Personalizar colores

Editar `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        secondary: '#3b82f6',
        // ...
      }
    }
  }
}
```

## 🔐 Autenticación

### Login

```tsx
import { useAuth } from './modules/auth/hooks/useAuth';

function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (data) => {
    await login(data.email, data.password);
  };

  // ...
}
```

### Rutas Protegidas

```tsx
import { ProtectedRoute } from './routes/ProtectedRoute';

<Route
  path="/cultivos"
  element={
    <ProtectedRoute>
      <CultivosPage />
    </ProtectedRoute>
  }
/>
```

## 📊 Gestión de Estado

### React Query (TanStack Query)

```tsx
import { useQuery } from '@tanstack/react-query';

function CultivosList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cultivos'],
    queryFn: () => cultivosApi.getAll()
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <CultivosTable data={data} />;
}
```

### Mutaciones

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateCultivo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: cultivosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos'] });
      toast.success('Cultivo creado exitosamente');
    }
  });

  // ...
}
```

## 🗺️ Mapas con Leaflet

### Mapa básico

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

<MapContainer center={[lat, lng]} zoom={13} style={{ height: '400px' }}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  <Marker position={[lat, lng]}>
    <Popup>Ubicación del cultivo</Popup>
  </Marker>
</MapContainer>
```

## 📄 Exportación de Reportes

### PDF con jsPDF

```tsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportToPDF = () => {
  const doc = new jsPDF();
  
  // Agregar título
  doc.setFontSize(20);
  doc.text('Reporte de Cultivo', 14, 20);
  
  // Agregar tabla
  autoTable(doc, {
    head: [['Columna 1', 'Columna 2']],
    body: data,
    startY: 30
  });
  
  // Descargar
  doc.save('reporte.pdf');
};
```

### Excel con XLSX

```tsx
import { exportToXLSX } from '@/shared/utils/exportUtils';

const exportToExcel = () => {
  const data = [
    ['Nombre', 'Valor'],
    ['Item 1', '100'],
    ['Item 2', '200']
  ];
  
  exportToXLSX(data, 'reporte');
};
```

## 🔌 WebSockets (IoT en tiempo real)

```tsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

function IoTMonitor() {
  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('sensor-reading', (data) => {
      console.log('Nueva lectura:', data);
      // Actualizar estado
    });

    return () => socket.disconnect();
  }, []);

  // ...
}
```

## 🐛 Debugging

### React DevTools

Instalar extensión de navegador:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### TanStack Query DevTools

Ya incluido en desarrollo. Abre el panel flotante en la esquina inferior izquierda para ver:
- Queries activas
- Cache de datos
- Estado de mutaciones

### Vite DevTools

Presiona `Shift + Alt + D` en el navegador para abrir el panel de Vite.

## 🚨 Solución de Problemas

### Error de conexión al backend

```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/api/health

# Verificar variable de entorno
echo $VITE_API_URL  # Linux/macOS
echo %VITE_API_URL%  # Windows CMD
$env:VITE_API_URL    # Windows PowerShell
```

### Error de CORS

Verificar configuración CORS en el backend (`backend-agrotech/src/main.ts`):

```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true
});
```

### Puerto 3000 en uso

```bash
# Cambiar puerto en vite.config.ts
export default defineConfig({
  server: {
    port: 3001
  }
})

# O usar variable de entorno
PORT=3001 npm run dev
```

### Caché de navegador o Vite

```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite

# Limpiar todo y reinstalar
rm -rf node_modules .vite package-lock.json
npm install
npm run dev
```

### Error de tipos TypeScript

```bash
# Verificar tipos sin compilar
npx tsc --noEmit

# Limpiar y reconstruir
npm run build
```

## 📦 Build para Producción

```bash
# Compilar
npm run build

# El output estará en /dist
ls -la dist/

# Servir build localmente para probar
npm run preview
```

### Optimizaciones de Build

El build de producción incluye:
- Tree shaking (elimina código no usado)
- Minificación de JS y CSS
- Compresión de imágenes
- Code splitting por rutas
- Lazy loading de componentes

### Deploy

#### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Vercel

```bash
# Instalar CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Servidor propio (Nginx)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔄 Actualización

```bash
# Actualizar dependencias menores
npm update

# Verificar dependencias obsoletas
npm outdated

# Actualizar React
npm install react@latest react-dom@latest

# Actualizar Vite
npm install vite@latest

# Actualizar todas (CUIDADO: puede romper cosas)
npm install -g npm-check-updates
ncu -u
npm install
```

## 📝 Convenciones de Código

- **Componentes**: PascalCase (ej: `UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useAuth.ts`)
- **Utilidades**: camelCase (ej: `formatDate.ts`)
- **Tipos**: PascalCase (ej: `User.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `API_URL`)
- **CSS Modules**: kebab-case (ej: `user-profile.module.css`)

## 📞 Soporte

Para problemas o consultas:
- **Email**: agrotechsena2025@gmail.com
- **Issues**: GitHub Issues
- **Documentación**: Ver carpeta `documentacion-agrotech/`

---

**Desarrollado con ❤️ por el equipo AgroTech SENA**
