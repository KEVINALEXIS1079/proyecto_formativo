// SubloteMapCallout.tsx
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Callout, CalloutPos } from "@/modules/cultivo/sublote/hooks/useSubloteCallout";

// Centro del mapa para mensajes sin posición específica
const DEFAULT_CENTER: CalloutPos = [1.8928, -76.091];

// Icono invisible para posicionar el Tooltip (Popup) centralizado
const invisibleIcon = L.divIcon({ className: "invisible-anchor" });

interface Props {
  callout: Callout;
}

/**
 * Componente UI para mostrar mensajes de error/info en el mapa de sublotes.
 */
export default function SubloteMapCallout({ callout }: Props) {
  const pos = callout.pos[0] === 0 && callout.pos[1] === 0 ? DEFAULT_CENTER : callout.pos;
  const kind = callout.kind || "error";

  return (
    <>
      <Marker
        position={pos}
        icon={invisibleIcon}
        interactive={false}
        opacity={0}
      >
        <Tooltip
          direction="right"
          offset={[20, 0]}
          permanent
          className={
            kind === "error"
              ? "tooltip-error"
              : kind === "info"
              ? "tooltip-info"
              : "tooltip-default"
          }
        >
          {callout.text}
        </Tooltip>
      </Marker>

      <style>{`
        /* Reinicio de estilos para permitir colores personalizados */
        .leaflet-tooltip-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .leaflet-tooltip-content {
          color: white !important;
          font-weight: 600 !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          text-align: center !important;
          font-size: 0.95rem !important;
          max-width: 260px !important;
          white-space: normal !important;
          border: none !important; 
          background-color: transparent !important;
        }

        /* ERRORES */
        .tooltip-error.leaflet-tooltip {
          background-color: #dc2626 !important; 
          border: 1px solid #b91c1c !important;
        }
        .tooltip-error.leaflet-tooltip-right::before,
        .tooltip-error.leaflet-tooltip-left::before,
        .tooltip-error.leaflet-tooltip-top::before,
        .tooltip-error.leaflet-tooltip-bottom::before { border-color: #dc2626 !important; }

        /* INFO */
        .tooltip-info.leaflet-tooltip {
          background-color: #3b82f6 !important;
          border: 1px solid #2563eb !important;
        }
        .tooltip-info.leaflet-tooltip-right::before,
        .tooltip-info.leaflet-tooltip-left::before,
        .tooltip-info.leaflet-tooltip-top::before,
        .tooltip-info.leaflet-tooltip-bottom::before { border-color: #3b82f6 !important; }

        /* DEFAULT */
        .tooltip-default.leaflet-tooltip {
          background-color: #6b7280 !important;
          border: 1px solid #4b5563 !important;
        }
        .tooltip-default.leaflet-tooltip-right::before,
        .tooltip-default.leaflet-tooltip-left::before,
        .tooltip-default.leaflet-tooltip-top::before,
        .tooltip-default.leaflet-tooltip-bottom::before { border-color: #6b7280 !important; }
      `}</style>
    </>
  );
}
