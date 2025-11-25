import { useState, useEffect, useCallback } from "react";

// --- Tipos Exportados ---
export type CalloutKind = "error" | "info" | "default";
export type CalloutPos = [number, number];

export interface Callout {
 pos: CalloutPos;
 text: string;
 kind: CalloutKind;
}

const DEFAULT_TIMEOUT = 3000;

/**
 * Hook para gestionar el estado de un popup de mapa (Callout) y su temporizador.
 * @param mensajeProp Mensaje general pasado por props (opcional).
 * @param clearMensajeProp Función para limpiar el mensaje general (opcional).
 * @param mensajeKindProp Tipo del mensaje general (opcional).
 * @returns El estado actual del callout y una función para establecer nuevos callouts.
 */
export const useMapCallout = (
  mensajeProp: string = "",
  clearMensajeProp: () => void = () => {},
  mensajeKindProp: CalloutKind = "info"
) => {
  const [callout, setCallout] = useState<Callout | null>(null);

  // Función para establecer un nuevo callout (usamos useCallback para estabilidad)
  const triggerCallout = useCallback(
    (pos: CalloutPos, text: string, kind: CalloutKind = "info") => {
      setCallout({ pos, text, kind });
    },
    []
  );

  // Efecto para manejar la temporización de ocultación
  useEffect(() => {
    // Verifica si hay un callout local O un mensaje pasado por prop
    if (callout || mensajeProp) {
      const t = setTimeout(() => {
        // Limpia el estado local y llama a la función de limpieza del prop
        setCallout(null);
        // Solo llama a clearMensajeProp si está definida y si se limpió el callout del prop
        if (mensajeProp) {
          clearMensajeProp();
        }
      }, DEFAULT_TIMEOUT);
      
      return () => clearTimeout(t);
    }
  // Dependencias: Si cambian el callout (estado local) o el mensajeProp (prop externo), reinicia el temporizador.
  }, [callout, mensajeProp, clearMensajeProp]); 

  // Combina el mensaje del hook (Callout local) o el mensaje del prop
  // La lógica de priorización es correcta: Callout local > Mensaje Prop > null
  const activeCallout: Callout | null = callout
    ? callout
    : mensajeProp
    ? {
          pos: [0, 0], // Posición especial que MapCallout.tsx interpreta como DEFAULT_CENTER
          text: mensajeProp,
          kind: mensajeKindProp,
        }
    : null;
    
  return { activeCallout, triggerCallout };
};