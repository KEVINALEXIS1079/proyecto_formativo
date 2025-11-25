export const ERROR_MESSAGES = {
  // Generales
  NOT_FOUND: (entity: string, id: number | string) => `${entity} con ID ${id} no encontrado`,
  ALREADY_EXISTS: (entity: string, field: string, value: string) => 
    `Ya existe un ${entity} con ${field}: ${value}`,
  INVALID_DATA: (field: string) => `Datos inválidos en el campo: ${field}`,
  REQUIRED_FIELD: (field: string) => `El campo ${field} es requerido`,
  
  // Auth
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    EMAIL_NOT_VERIFIED: 'Correo electrónico no verificado',
    EMAIL_ALREADY_VERIFIED: 'El correo ya ha sido verificado',
    INVALID_CODE: 'Código de verificación inválido o expirado',
    CODE_EXPIRED: 'El código de verificación ha expirado',
    USER_INACTIVE: 'Usuario inactivo',
    WEAK_PASSWORD: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
    EMAIL_IN_USE: 'El correo electrónico ya está en uso',
    IDENTIFICATION_IN_USE: 'La identificación ya está registrada',
  },

  // Permisos
  PERMISSIONS: {
    INSUFFICIENT: (required: string[]) => 
      `Permisos insuficientes. Se requiere uno de: ${required.join(', ')}`,
    ALREADY_ASSIGNED: (type: string) => `El permiso ya está asignado a este ${type}`,
    NOT_ASSIGNED: (type: string) => `El permiso no está asignado a este ${type}`,
    SYSTEM_ROLE: 'No se puede modificar un rol del sistema',
    ROLE_NOT_DELETED: 'El rol no está eliminado',
    USER_NOT_DELETED: 'El usuario no está eliminado',
  },

  // Geo
  GEO: {
    INVALID_POLYGON: 'El polígono no es válido (debe ser simple, sin autointersecciones)',
    SUBLOTE_NOT_CONTAINED: 'El sublote debe estar completamente contenido en el lote',
    SUBLOTE_OVERLAPS: 'El sublote se solapa con otro sublote existente',
    SUBLOTE_NAME_EXISTS: (name: string, loteId: number) => 
      `Ya existe un sublote con nombre "${name}" en el lote ${loteId}`,
    CULTIVO_XOR_VIOLATION: 'Debe especificar loteId O subLoteId, no ambos',
    CULTIVO_LOCATION_REQUIRED: 'Debe especificar al menos loteId o subLoteId',
    CULTIVO_ALREADY_ACTIVE: 'Ya existe un cultivo activo en esta ubicación',
    LOTE_NOT_FOUND: (id: number) => `Lote ${id} no encontrado`,
    SUBLOTE_NOT_FOUND: (id: number) => `SubLote ${id} no encontrado`,
    CULTIVO_NOT_FOUND: (id: number) => `Cultivo ${id} no encontrado`,
  },

  // Activities
  ACTIVITIES: {
    INVALID_LOCATION: 'La ubicación (lote/sublote) no coincide con el cultivo',
    CULTIVO_NOT_FOUND: (id: number) => `Cultivo ${id} no encontrado`,
    INVALID_SUBTIPO: (subtipo: string) => `Subtipo de actividad inválido: ${subtipo}`,
    SIEMBRA_REQUIRES_FECHA: 'Las actividades de tipo SIEMBRA requieren fecha de siembra',
    COSECHA_REQUIRES_CANTIDAD: 'Las actividades de tipo COSECHA requieren cantidad cosechada',
    ACTIVITY_NOT_FOUND: (id: number) => `Actividad ${id} no encontrada`,
  },

  // Inventory
  INVENTORY: {
    INSUFFICIENT_STOCK: (available: number, requested: number, unit: string) =>
      `Stock insuficiente. Disponible: ${available} ${unit}, Solicitado: ${requested} ${unit}`,
    NEGATIVE_STOCK: 'El stock no puede ser negativo',
    INVALID_MOVEMENT_TYPE: (type: string) => `Tipo de movimiento inválido: ${type}`,
    INSUMO_NOT_FOUND: (id: number) => `Insumo ${id} no encontrado`,
    ALMACEN_NOT_FOUND: (id: number) => `Almacén ${id} no encontrado`,
    PROVEEDOR_NOT_FOUND: (id: number) => `Proveedor ${id} no encontrado`,
  },

  // IoT
  IOT: {
    SENSOR_NOT_FOUND: (id: number) => `Sensor ${id} no encontrado`,
    TIPO_SENSOR_NOT_FOUND: (id: number) => `Tipo de sensor ${id} no encontrado`,
    INVALID_PROTOCOL: (protocol: string) => `Protocolo inválido: ${protocol}`,
    SENSOR_DISCONNECTED: (id: number) => `Sensor ${id} desconectado`,
    THRESHOLD_EXCEEDED: (value: number, threshold: number, type: 'min' | 'max') =>
      `Valor ${value} ${type === 'min' ? 'por debajo del mínimo' : 'por encima del máximo'}: ${threshold}`,
  },

  // Production/POS
  POS: {
    INSUFFICIENT_STOCK: (loteId: number, available: number, requested: number) =>
      `Stock insuficiente en lote ${loteId}. Disponible: ${available} kg, Solicitado: ${requested} kg`,
    PAYMENT_INSUFFICIENT: (total: number, paid: number) =>
      `Pago insuficiente. Total: $${total}, Pagado: $${paid}`,
    VENTA_ALREADY_ANULADA: 'La venta ya está anulada',
    VENTA_NOT_FOUND: (id: number) => `Venta ${id} no encontrada`,
    CLIENTE_NOT_FOUND: (id: number) => `Cliente ${id} no encontrado`,
    PRODUCTO_NOT_FOUND: (id: number) => `Producto ${id} no encontrado`,
    LOTE_PRODUCCION_NOT_FOUND: (id: number) => `Lote de producción ${id} no encontrado`,
  },

  // Wiki
  WIKI: {
    EPA_NOT_FOUND: (id: number) => `EPA ${id} no encontrada`,
    TIPO_CULTIVO_NOT_FOUND: (id: number) => `Tipo de cultivo ${id} no encontrado`,
    INVALID_TIPO_EPA: (tipo: string) => `Tipo de EPA inválido: ${tipo}. Debe ser ENFERMEDAD, PLAGA o ARVENCE`,
  },
};

export const SUCCESS_MESSAGES = {
  CREATED: (entity: string) => `${entity} creado exitosamente`,
  UPDATED: (entity: string) => `${entity} actualizado exitosamente`,
  DELETED: (entity: string) => `${entity} eliminado exitosamente`,
  RESTORED: (entity: string) => `${entity} restaurado exitosamente`,
  
  AUTH: {
    REGISTERED: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta',
    EMAIL_VERIFIED: 'Correo verificado exitosamente',
    CODE_SENT: 'Código de verificación enviado',
    PASSWORD_RESET: 'Contraseña restablecida exitosamente',
    LOGGED_IN: 'Sesión iniciada exitosamente',
    LOGGED_OUT: 'Sesión cerrada exitosamente',
  },

  PERMISSIONS: {
    ASSIGNED: (permiso: string, target: string) => `Permiso "${permiso}" asignado a ${target}`,
    REMOVED: (permiso: string, target: string) => `Permiso "${permiso}" removido de ${target}`,
    SYNCED: (count: number, target: string) => `${count} permisos sincronizados para ${target}`,
  },

  POS: {
    VENTA_CREATED: (id: number, total: number) => `Venta #${id} creada exitosamente. Total: $${total}`,
    VENTA_ANULADA: (id: number) => `Venta #${id} anulada exitosamente`,
  },
};
