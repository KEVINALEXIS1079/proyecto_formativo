// shared/config/routes.ts
// Rutas base de la aplicación

export const ROUTES = {
  HOME: "/home",
  LOGIN: "/login",
  REGISTER: "/register",
  RECOVER: "/recover",
  CODE: "/code",
  CHANGE_PASSWORD: "/change-password",

  // Módulos
  USUARIOS: "/usuarios",
  PERFIL: "/perfil",
  ACTIVIDADES: "/actividades",
  CULTIVOS: "/cultivos",
  FITOSANITARIO: "/fitosanitario",
  INVENTARIO: "/inventario",
  FINANZAS: "/finanzas",
  REPORTES: "/reportes",
  PERMISOS: "/permisos",

  // IoT
  SENSORES: "/SensoresLivePage",
  TIPO_SENSOR: "/TipoSensorPage",
} as const;