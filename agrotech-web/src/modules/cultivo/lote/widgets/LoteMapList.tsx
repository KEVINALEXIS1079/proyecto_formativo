// src/modules/lote/widgets/LoteMapList.tsx
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { useState, useEffect, Fragment } from "react";
import MapCallout from "../ui/MapCallout";
import LotePopup from "../ui/LotePopup";
import type { Callout } from "../hooks/UseMapCallout";

export interface Coordenada {
  latitud: number;
  longitud: number;
}

export interface Lote {
  id_lote_pk: number;
  nombre_lote: string;
  coordenadas: Coordenada[];
}

type Props = {
  lotes: Lote[];
  editable?: boolean;
  onChange?: (coords: Coordenada[], loteId: number) => void;
};

const DEFAULT_TIMEOUT = 3000;

export default function LoteMapList({ lotes, editable = false, onChange }: Props) {
  const [coordsState, setCoordsState] = useState<Record<number, Coordenada[]>>({});
  const [callout, setCallout] = useState<Callout | null>(null);

  // Inicializa el estado de coordenadas cuando cambian los lotes
  useEffect(() => {
    const initial: Record<number, Coordenada[]> = {};
    lotes.forEach((lote) => {
      initial[lote.id_lote_pk] = [...(lote.coordenadas || [])];
    });
    setCoordsState(initial);
  }, [lotes]);

  // Limpia automáticamente el callout
  useEffect(() => {
    if (!callout) return;
    const t = setTimeout(() => setCallout(null), DEFAULT_TIMEOUT);
    return () => clearTimeout(t);
  }, [callout]);

  const handleDragMarker = (loteId: number, index: number, lat: number, lng: number) => {
    const newCoords = [...(coordsState[loteId] || [])];
    newCoords[index] = { latitud: lat, longitud: lng };
    setCoordsState((prev) => ({ ...prev, [loteId]: newCoords }));
    onChange?.(newCoords, loteId);
  };

  // Editor para añadir puntos por lote (solo si editable)
  function MapEditor({ loteId }: { loteId: number }) {
    useMapEvents({
      click(e) {
        if (!editable) return;
        const currentCoords = coordsState[loteId] || [];
        const newCoords = [
          ...currentCoords,
          { latitud: e.latlng.lat, longitud: e.latlng.lng },
        ];
        setCoordsState((prev) => ({ ...prev, [loteId]: newCoords }));
        onChange?.(newCoords, loteId);
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={[1.8928, -76.091]}
      zoom={18}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {lotes.map((lote) => {
        const coords = coordsState[lote.id_lote_pk] || [];

        // Si no hay coordenadas válidas, no renderices polígono/markers
        if (!coords || coords.length === 0) {
          // Si está editable queremos aún tener el MapEditor montado
          return (
            <Fragment key={lote.id_lote_pk}>
              {editable && <MapEditor loteId={lote.id_lote_pk} />}
            </Fragment>
          );
        }

        const positions = coords.map((c) => [c.latitud, c.longitud]) as [number, number][];

        return (
          <Fragment key={lote.id_lote_pk}>
            {editable && <MapEditor loteId={lote.id_lote_pk} />}

            <Polygon
              positions={positions}
              pathOptions={{
                color: editable ? "#16a34a" : "#2563eb",
                fillOpacity: 0.32,
                weight: 2,
              }}
            >
              <Tooltip direction="top" sticky>
                <LotePopup
                  lote={{ nombre: lote.nombre_lote, coordenadas: coords }}
                  coords={coords}
                />
              </Tooltip>
            </Polygon>

            {editable &&
              coords.map((c, i) => (
                <Marker
                  key={i}
                  position={[c.latitud, c.longitud]}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      // @ts-ignore - leaflet types a veces tipan e.target como any en runtime
                      const { lat, lng } = e.target.getLatLng();
                      handleDragMarker(lote.id_lote_pk, i, lat, lng);
                    },
                  }}
                />
              ))}
          </Fragment>
        );
      })}

      {callout && <MapCallout callout={callout} />}
    </MapContainer>
  );
}
