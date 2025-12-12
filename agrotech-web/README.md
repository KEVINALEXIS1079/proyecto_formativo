# Frontend Web Agrotech

Plataforma web desarrollada con **React 19**, **Vite** y **TailwindCSS v4**.

## Requisitos

- **Node.js**: v18 o superior

## Configuración

Asegúrate de que el backend esté corriendo en el puerto esperado (por defecto 4000).

## Comandos Principales

### Instalación
```bash
npm install
```

### Desarrollo
Inicia el servidor de desarrollo en `http://localhost:5173`.
```bash
npm run dev
```

### Construcción (Build)
Genera los archivos estáticos para producción en la carpeta `dist`.
```bash
npm run build
```

### Previsualización
Sirve la versión construida localmente para pruebas.
```bash
npm run preview
```

## Estructura de Directorios

-   `src/components`: Componentes reutilizables UI.
-   `src/pages`: Vistas principales de la aplicación.
-   `src/features`: Módulos de negocio (Auth, Inventario, Mapas).
-   `src/contexts`: Estados globales (AuthContext, etc).
-   `src/services`: Comunicación con la API Backend.
