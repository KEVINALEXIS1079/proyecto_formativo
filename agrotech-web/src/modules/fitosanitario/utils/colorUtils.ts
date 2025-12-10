// Utilidades para colores consistentes en el módulo fitosanitario

import { Zap, Bug, Leaf, Info } from 'lucide-react';

/**
 * Obtiene el color correspondiente para un tipo EPA
 * @param tipo - El tipo de EPA ('enfermedad', 'plaga', 'arvense')
 * @returns El color RGBA para usar como fondo en componentes
 */
export const getTipoEpaColor = (tipo: string): string => {
  switch (tipo?.toLowerCase()) {
    case 'enfermedad':
      return 'rgba(255, 182, 193, 0.4)'; // Light pink with opacity
    case 'plaga':
      return 'rgba(173, 216, 230, 0.4)'; // Light blue with opacity
    case 'arvense':
      return 'rgba(144, 238, 144, 0.4)'; // Light green with opacity
    default:
      return 'rgba(200, 200, 200, 0.4)'; // Light gray with opacity
  }
};

/**
 * Obtiene el ícono correspondiente para un tipo EPA
 * @param tipo - El tipo de EPA ('enfermedad', 'plaga', 'arvense')
 * @returns El componente React del ícono
 */
export const getTipoEpaIcon = (tipo: string) => {
  // ❌ Se eliminó la línea "const { Zap, Bug, Leaf, Info } = require('lucide-react');"
  //    ya que causa el error ReferenceError.
  
  switch (tipo?.toLowerCase()) {
    case 'enfermedad':
      return Zap;
    case 'plaga':
      return Bug;
    case 'arvense':
      return Leaf;
    default:
      return Info;
  }
};
