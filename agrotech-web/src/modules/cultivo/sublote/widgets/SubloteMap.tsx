// SubloteMap.tsx
import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { getAreaOfPolygon, getDistance, isPointInPolygon } from "geolib";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import MapCallout from "../ui/SubloteMapCallout";
import { useMapCallout, type CalloutKind } from "../../lote/hooks/UseMapCallout";
import type { Sublote } from "../model/types";
import type { Lote } from "../../lote/model/types";

// ------------------------------
// Tipos exportados
// ------------------------------
export type CoordenadaSublote = { latitud_sublote: number; longitud_sublote: number };

export type SubloteExistente = {
  nombre_sublote: string;
  coordenadas_sublote: CoordenadaSublote[];
};

export type LoteExistente = {
  id_lote_pk: number;
  nombre_lote: string;
  coordenadas_lote: { latitud_lote: number; longitud_lote: number }[];
};

// ------------------------------
// Props del componente
// ------------------------------
type Props = {
  coordenadas: CoordenadaSublote[];
  setCoordenadas: (c: CoordenadaSublote[]) => void;
  setArea?: (a: number) => void;
  sublotesExistentes?: Sublote[];
  lotes?: Lote[];
  loteSeleccionado?: string;
  setLoteSeleccionado?: (id: string) => void;
  mensaje?: string;
  clearMensaje?: () => void;
  mensajeKind?: CalloutKind;
};

const DEFAULT_CENTER: [number, number] = [1.8928, -76.091];
const MIN_DISTANCE_METERS = 0.5;

// --- Marker memoizado ---
const DraggableMarker = memo(
  ({
    c,
    index,
    onDrag,
  }: {
    c: CoordenadaSublote;
    index: number;
    onDrag: (i: number, lat: number, lng: number) => void;
  }) => {
    if (isNaN(c.latitud_sublote) || isNaN(c.longitud_sublote)) return null;

    return (
      <Marker
        position={[c.latitud_sublote, c.longitud_sublote]}
        draggable
        eventHandlers={{
          drag: (e) => {
            const { lat, lng } = e.target.getLatLng();
            if (!isNaN(lat) && !isNaN(lng)) onDrag(index, lat, lng);
          },
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            if (!isNaN(lat) && !isNaN(lng)) onDrag(index, lat, lng);
          },
        }}
      >
        <Tooltip direction="right" offset={[15, 0]} opacity={1} sticky>
          <div>
            <strong>Punto {index + 1}</strong>
            <br />
            Lat: {c.latitud_sublote.toFixed(6)}
            <br />
            Lng: {c.longitud_sublote.toFixed(6)}
          </div>
        </Tooltip>
      </Marker>
    );
  }
);

export default function SubloteMap({
  coordenadas,
  setCoordenadas,
  setArea = () => {},
  sublotesExistentes = [],
  lotes = [],
  loteSeleccionado = "",
  setLoteSeleccionado = () => {},
  mensaje = "",
  clearMensaje = () => {},
  mensajeKind = "info",
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const [hoveredLote, setHoveredLote] = useState<Lote | null>(null);

  const { activeCallout, triggerCallout } = useMapCallout(mensaje, clearMensaje, mensajeKind);

  // --- FlyTo al mostrar mensaje ---
  useEffect(() => {
    if (activeCallout && mapRef.current) {
      const pos = activeCallout.pos[0] !== 0 || activeCallout.pos[1] !== 0 ? activeCallout.pos : DEFAULT_CENTER;
      mapRef.current.flyTo(pos, 19, { animate: true });
    }
  }, [activeCallout]);

  // --- Calcular área ---
  useEffect(() => {
    if (coordenadas.length > 2) {
      const area = Math.round(
        getAreaOfPolygon(coordenadas.map((c) => ({ latitude: c.latitud_sublote, longitude: c.longitud_sublote })))
      );
      setArea(area);
    } else setArea(0);
  }, [coordenadas, setArea]);

  // --- Limpiar coordenadas al cambiar lote ---
  useEffect(() => {
    setCoordenadas([]);
    setArea(0);
  }, [loteSeleccionado]);

  // --- Validar punto ---
  const checkValidPoint = useCallback(
    (lat: number, lng: number) => {
      if (!loteSeleccionado) {
        triggerCallout([lat, lng], "Selecciona primero un lote.", "error");
        return false;
      }

      // Obtener lote padre
      const lote = lotes.find((l) => l.id_lote_pk === Number(loteSeleccionado));
      if (!lote || lote.coordenadas_lote.length < 3) {
        triggerCallout([lat, lng], "Este lote no tiene coordenadas válidas.", "error");
        return false;
      }

      const coordenadasLote = lote.coordenadas_lote.map((p) => ({ latitude: p.latitud_lote, longitude: p.longitud_lote }));

      if (!isPointInPolygon({ latitude: lat, longitude: lng }, coordenadasLote)) {
        triggerCallout([lat, lng], "El punto está fuera del lote.", "error");
        return false;
      }

      // Distancia mínima de otros sublotes/lotes
      const demasiadoCerca = [
        ...sublotesExistentes.flatMap((s) => s.coordenadas_sublote),
        ...lotes.flatMap((l) => l.coordenadas_lote.map((p) => ({ latitud_sublote: p.latitud_lote, longitud_sublote: p.longitud_lote })) ),
      ].some((p) => getDistance({ latitude: p.latitud_sublote, longitude: p.longitud_sublote }, { latitude: lat, longitude: lng }) < MIN_DISTANCE_METERS);

      if (demasiadoCerca) {
        triggerCallout([lat, lng], `Zona restringida: demasiado cerca (${MIN_DISTANCE_METERS}m) de otro lote o sublote.`, "error");
        return false;
      }

      // Dentro de otro sublote
      const dentroDeOtro = sublotesExistentes.some((sub) =>
        sub.coordenadas_sublote.length >= 3 &&
        isPointInPolygon({ latitude: lat, longitude: lng }, sub.coordenadas_sublote.map((p) => ({ latitude: p.latitud_sublote, longitude: p.longitud_sublote })))
      );

      if (dentroDeOtro) {
        triggerCallout([lat, lng], "No puedes colocar un punto dentro de otro sublote.", "error");
        return false;
      }

      return true;
    },
    [loteSeleccionado, lotes, sublotesExistentes, triggerCallout]
  );

  const handleAddPoint = useCallback(
    (lat: number, lng: number) => {
      if (!checkValidPoint(lat, lng)) return;
      setCoordenadas([...coordenadas, { latitud_sublote: lat, longitud_sublote: lng }]);
    },
    [coordenadas, setCoordenadas, checkValidPoint]
  );

  const handleDragMarker = useCallback(
    (index: number, lat: number, lng: number) => {
      if (!checkValidPoint(lat, lng)) return;
      const nuevas = [...coordenadas];
      nuevas[index] = { latitud_sublote: lat, longitud_sublote: lng };
      setCoordenadas(nuevas);
    },
    [coordenadas, setCoordenadas, checkValidPoint]
  );

  const MapPicker = () => {
    useMapEvents({
      click(e) {
        handleAddPoint(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const polygonCoords = coordenadas.length >= 3 ? [...coordenadas, coordenadas[0]] : [];

  return (
    <div className="h-96 rounded-xl overflow-hidden border border-gray-200 relative">
      <MapContainer center={DEFAULT_CENTER} zoom={19} style={{ height: "100%", width: "100%" }} ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapPicker />

        {/* Sublote en edición */}
        {coordenadas.length > 0 && (
          <>
            {coordenadas.length < 3 ? (
              <Polyline
                positions={coordenadas.map((c) => [c.latitud_sublote, c.longitud_sublote])}
                pathOptions={{ color: "#facc15", weight: 4, dashArray: "8,6" }}
              />
            ) : (
              <Polygon
                positions={polygonCoords.map((c) => [c.latitud_sublote, c.longitud_sublote])}
                pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.3 }}
              />
            )}
            {coordenadas.map((c, i) => (
              <DraggableMarker key={i} c={c} index={i} onDrag={handleDragMarker} />
            ))}
          </>
        )}

        {/* Sublotes existentes */}
        {sublotesExistentes.map((sub, i) =>
          sub.coordenadas_sublote.length >= 3 ? (
            <Polygon
              key={i}
              positions={sub.coordenadas_sublote.map((c) => [c.latitud_sublote, c.longitud_sublote])}
              pathOptions={{ color: "blue", fillOpacity: 0.25 }}
            />
          ) : null
        )}

        {/* Lotes */}
        {lotes.map((lote) =>
          lote.coordenadas_lote.length >= 3 ? (
            <Polygon
              key={lote.id_lote_pk}
              positions={lote.coordenadas_lote.map((c) => [c.latitud_lote, c.longitud_lote])}
              pathOptions={{
                color: hoveredLote?.id_lote_pk === lote.id_lote_pk ? "#2563eb" : "gray",
                fillColor: hoveredLote?.id_lote_pk === lote.id_lote_pk ? "#93c5fd" : "#9b82f6",
                fillOpacity: hoveredLote ? 0.3 : 0.15,
                weight: 2,
              }}
              eventHandlers={{
                mouseover: () => setHoveredLote(lote),
                mouseout: () => setHoveredLote(null),
                click: () => setLoteSeleccionado(String(lote.id_lote_pk)),
              }}
            />
          ) : null
        )}

        {/* Callout */}
        {activeCallout && <MapCallout callout={activeCallout} />}
      </MapContainer>

      {loteSeleccionado && (
        <div className="absolute top-2 left-2 bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm font-semibold">
          Lote seleccionado: {lotes.find((l) => String(l.id_lote_pk) === loteSeleccionado)?.nombre_lote || "Desconocido"}
        </div>
      )}
    </div>
  );
}
