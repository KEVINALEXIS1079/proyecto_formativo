export const MODULE_LABELS: Record<string, string> = {
    auth: "Autenticación",
    users: "Gestión de Usuarios",
    roles: "Roles y Permisos",
    geo: "Geografía (Lotes/Sublotes)",
    cultivos: "Gestión de Cultivos",
    actividad: "Actividades de Campo",
    inventario: "Inventario e Insumos",
    iot: "Monitoreo IoT",
    reports: "Reportes y Analítica",
    fitosanitario: "Sanidad Vegetal (EPA)",
    comercial: "Comercial y Finanzas",
    profile: "Perfil de Usuario"
};

export const formatModuleName = (key: string) => MODULE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
