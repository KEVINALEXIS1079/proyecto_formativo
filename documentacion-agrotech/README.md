# 📚 Documentación Técnica AgroTech SENA

## 📋 Descripción

Sitio web de documentación técnica desarrollado con **Astro** que contiene toda la documentación del sistema AgroTech SENA. Incluye guías de instalación, API reference, arquitectura del sistema y más.

## 🛠️ Stack Tecnológico

- **Framework**: Astro 5.6.1 (generador de sitios estáticos)
- **UI**: Starlight 0.36.2 (tema de documentación)
- **Lenguaje**: TypeScript 5.x
- **Content Collections**: Gestión de contenido en Markdown
- **Optimización**: Sharp 0.34.2 (procesamiento de imágenes)
- **Puerto**: 4321 (desarrollo)

## 🗂️ Estructura del Proyecto

```
documentacion-agrotech/
├── src/
│   ├── assets/           # Recursos (imágenes, iconos)
│   ├── content/          # Contenido de documentación en Markdown
│   │   ├── docs/         # Documentos de documentación
│   │   ├── guides/       # Guías y tutoriales
│   │   └── api/          # Referencia de API
│   ├── content.config.ts # Configuración de colecciones de contenido
│   ├── layouts/          # Layouts de páginas
│   ├── components/       # Componentes de Astro
│   └── pages/            # Páginas del sitio
├── public/               # Archivos estáticos
├── dist/                 # Build de producción (generado)
├── .astro/               # Caché de Astro
├── astro.config.mjs      # Configuración de Astro
├── tsconfig.json         # Configuración TypeScript
├── package.json          # Dependencias
└── README.md             # Este archivo
```

## 📦 Prerrequisitos

- **Node.js** 18.x
- **npm** 9.x

### Verificar versiones

```bash
node --version  # Debe ser v18.x
npm --version   # Debe ser 9.x
```

## 🚀 Instalación

### 1. Navegar al directorio

```bash
cd proyecto_formativo/documentacion-agrotech
```

### 2. Instalar dependencias

```bash
npm install
```

## 🏃 Ejecución

### Modo Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en: **http://localhost:4321**

### Modo Producción

```bash
# Compilar sitio estático
npm run build

# Previsualizar build
npm run preview
```

## 📝 Agregar Documentación

### Crear nuevo documento

1. Crear archivo `.md` en `src/content/docs/`
2. Agregar frontmatter:

```markdown
---
title: "Título del documento"
description: "Descripción breve"
---

# Contenido del documento

Tu contenido aquí...
```

### Estructura de contenido

```
src/content/
├── docs/              # Documentación general
│   ├── introduccion.md
│   ├── arquitectura.md
│   └── base-datos.md
├── guides/            # Guías paso a paso
│   ├── instalacion-backend.md
│   ├── instalacion-web.md
│   └── instalacion-movil.md
└── api/               # Referencia de API
    ├── auth.md
    ├── cultivos.md
    └── iot.md
```

## 🎨 Personalización

### Configuración de Astro

Editar `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://tu-dominio.com',
  // ...
});
```

### Estilos

Los estilos globales están en `src/styles/global.css`

## � Build para Producción

```bash
# Generar sitio estático
npm run build

# Output en /dist
ls -la dist/
```

El build genera archivos HTML estáticos optimizados que pueden ser servidos desde cualquier servidor web.

## � Deploy

### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Vercel

```bash
# Instalar CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages

```bash
# Configurar en astro.config.mjs
export default defineConfig({
  site: 'https://usuario.github.io',
  base: '/repo-name',
});

# Build y deploy
npm run build
# Subir carpeta dist/ a gh-pages branch
```

## � Contenido Disponible

### Documentación Técnica
- Arquitectura del sistema
- Modelo de base de datos
- Diagramas y flujos
- Patrones de diseño

### Guías de Instalación
- Instalación completa del sistema
- Configuración de backend (PostgreSQL, NestJS)
- Configuración de frontend web (React, Vite)
- Configuración de app móvil (React Native, Expo)

### API Reference
- Endpoints de autenticación
- Endpoints de cultivos
- Endpoints de IoT
- Endpoints de reportes
- Ejemplos de uso

### Guías para Desarrolladores
- Estándares de código
- Git workflow
- Proceso de contribución
- Testing y debugging

## 🔄 Actualización

```bash
# Actualizar dependencias
npm update

# Actualizar Astro
npm install astro@latest
```

## 📞 Soporte

Para problemas o consultas:
- **Email**: agrotechsena2025@gmail.com
- **Documentación Astro**: https://docs.astro.build/

---

**Documentación técnica del proyecto AgroTech SENA**

*Última actualización: Diciembre 2025*
