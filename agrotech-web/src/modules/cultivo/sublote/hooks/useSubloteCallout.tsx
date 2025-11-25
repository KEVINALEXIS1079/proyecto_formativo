// useSubloteCallout.ts
import { useState, useEffect, useCallback } from "react";

// --- Tipos ---
export type CalloutKind = "error" | "info" | "default";
export type CalloutPos = [number, number];

export interface Callout {
  pos: CalloutPos;
  text: string;
  kind: CalloutKind;
}

const DEFAULT_TIMEOUT = 3000;

/**
 * Hook para gestionar mensajes en el mapa para sublotes (Callout)
 * @param mensajeProp Mensaje externo opcional
 * @param clearMensajeProp Función para limpiar mensaje externo
 * @param mensajeKindProp Tipo del mensaje externo
 */
export const useSubloteCallout = (
  mensajeProp: string = "",
  clearMensajeProp: () => void = () => {},
  mensajeKindProp: CalloutKind = "info"
) => {
  const [callout, setCallout] = useState<Callout | null>(null);

  // Función para disparar un callout
  const triggerCallout = useCallback(
    (pos: CalloutPos, text: string, kind: CalloutKind = "info") => {
      setCallout({ pos, text, kind });
    },
    []
  );

  // Temporizador automático para ocultar el callout
  useEffect(() => {
    if (callout || mensajeProp) {
      const t = setTimeout(() => {
        setCallout(null);
        if (mensajeProp) {
          clearMensajeProp();
        }
      }, DEFAULT_TIMEOUT);

      return () => clearTimeout(t);
    }
  }, [callout, mensajeProp, clearMensajeProp]);

  // Callout activo (prioridad: local > prop > null)
  const activeCallout: Callout | null = callout
    ? callout
    : mensajeProp
    ? {
        pos: [0, 0], // Se interpreta como DEFAULT_CENTER en MapCallout
        text: mensajeProp,
        kind: mensajeKindProp,
      }
    : null;

  return { activeCallout, triggerCallout };
};
