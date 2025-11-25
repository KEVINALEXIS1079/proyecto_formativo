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
import "leaflet/dist/leaflet.css";
import MapCallout from "../ui/MapCallout";
import { useMapCallout, type CalloutKind } from "../hooks/UseMapCallout";
import L from "leaflet";

export type Coordenada = { latitud: number; longitud: number };
export type LoteExistente = { nombre: string; coordenadas: Coordenada[] };

type Props = {
  coordenadas: Coordenada[];
  setCoordenadas: (c: Coordenada[]) => void;
  setArea?: (a: number) => void;
  lotesExistentes?: LoteExistente[];
  mensaje?: string;
  clearMensaje?: () => void;
  mensajeKind?: CalloutKind;
};

const DEFAULT_CENTER: [number, number] = [1.8928, -76.091];
const MIN_DISTANCE_METERS = 0.5;

// --- Marker memoizado para mejorar rendimiento ---
const DraggableMarker = memo(
  ({
    c,
    index,
    onDrag,
  }: {
    c: Coordenada;
    index: number;
    onDrag: (i: number, lat: number, lng: number) => void;
  }) => {
    if (typeof c.latitud !== "number" || typeof c.longitud !== "number" || isNaN(c.latitud) || isNaN(c.longitud)) {
      return null;
    }

    return (
      <Marker
        position={[c.latitud, c.longitud]}
        draggable
        eventHandlers={{
          drag: (e) => {
            const { lat, lng } = e.target.getLatLng();
            if (!isNaN(lat) && !isNaN(lng)) onDrag(index, lat, lng); // Actualización en tiempo real
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
            Lat: {c.latitud.toFixed(6)}
            <br />
            Lng: {c.longitud.toFixed(6)}
          </div>
        </Tooltip>
      </Marker>
    );
  }
);

export default function LoteMap({
  coordenadas,
  setCoordenadas,
  setArea = () => {},
  lotesExistentes = [],
  mensaje = "",
  clearMensaje = () => {},
  mensajeKind = "info",
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const [hoveredLote, setHoveredLote] = useState<LoteExistente | null>(null);

  const { activeCallout, triggerCallout } = useMapCallout(mensaje, clearMensaje, mensajeKind);

  // --- FlyTo para mensajes ---
  useEffect(() => {
    if (activeCallout) {
      const pos = activeCallout.pos[0] || activeCallout.pos[1] ? activeCallout.pos : DEFAULT_CENTER;
      if (mapRef.current) mapRef.current.flyTo(pos, 19, { animate: true });
    }
  }, [activeCallout]);

  // --- Calcular área ---
  useEffect(() => {
    if (coordenadas.length > 2) {
      const area = Math.round(
        getAreaOfPolygon(coordenadas.map((c) => ({ latitude: c.latitud, longitude: c.longitud })))
      );
      setArea(area);
    } else setArea(0);
  }, [coordenadas, setArea]);

  // --- Validación de puntos ---
  const checkValidPoint = useCallback(
    (lat: number, lng: number): boolean => {
      if (isNaN(lat) || isNaN(lng)) return false;

      const newGeoPoint = { latitude: lat, longitude: lng };
      const pos: [number, number] = [lat, lng];

      // Dentro de otro lote
      const dentroDeOtroLote = lotesExistentes.some((lote) =>
        isPointInPolygon(
          newGeoPoint,
          lote.coordenadas.map((p) => ({ latitude: p.latitud, longitude: p.longitud }))
        )
      );
      if (dentroDeOtroLote) {
        triggerCallout(pos, "No puedes colocar un punto dentro de un lote existente.", "error");
        return false;
      }

      // Distancia mínima
      const demasiadoCerca = lotesExistentes.some((lote) =>
        lote.coordenadas.some(
          (p) => getDistance({ latitude: p.latitud, longitude: p.longitud }, newGeoPoint) < MIN_DISTANCE_METERS
        )
      );
      if (demasiadoCerca) {
        triggerCallout(pos, `Zona restringida: demasiado cerca (${MIN_DISTANCE_METERS}m) de otro lote.`, "error");
        return false;
      }

      return true;
    },
    [lotesExistentes, triggerCallout]
  );

  const handleAddPoint = useCallback(
    (lat: number, lng: number) => {
      if (!checkValidPoint(lat, lng)) return;
      setCoordenadas([...coordenadas, { latitud: lat, longitud: lng }]);
    },
    [coordenadas, setCoordenadas, checkValidPoint]
  );

  const handleDragMarker = useCallback(
    (index: number, lat: number, lng: number) => {
      if (!checkValidPoint(lat, lng)) return;
      const nuevas = [...coordenadas];
      nuevas[index] = { latitud: lat, longitud: lng };
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

        {/* Polígono activo */}
        {coordenadas.length > 0 && (
          <>
            {coordenadas.length < 3 ? (
              <Polyline
                positions={coordenadas.map((c) => [c.latitud, c.longitud])}
                pathOptions={{ color: "#facc15", weight: 4, dashArray: "8,6" }}
              />
            ) : (
              <Polygon
                positions={polygonCoords.map((c) => [c.latitud, c.longitud])}
                pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.3 }}
              />
            )}
            {coordenadas.map((c, i) => (
              <DraggableMarker key={i} c={c} index={i} onDrag={handleDragMarker} />
            ))}
          </>
        )}

        {/* Lotes existentes */}
        {lotesExistentes.map((lote, i) => {
          if (lote.coordenadas.length < 3) return null;
          return (
            <Polygon
              key={i}
              positions={lote.coordenadas.map((p) => [p.latitud, p.longitud])}
              pathOptions={{
                color: hoveredLote?.nombre === lote.nombre ? "#2563eb" : "grey",
                fillColor: hoveredLote?.nombre === lote.nombre ? "#93c5fd" : "#9b82f6",
                fillOpacity: hoveredLote ? 0.3 : 0.15,
                weight: 2,
              }}
              eventHandlers={{
                mouseover: () => setHoveredLote(lote),
                mouseout: () => setHoveredLote(null),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                <div>
                  <strong>{lote.nombre}</strong>
                  <br />
                  Puntos: {lote.coordenadas.length}
                  <br />
                  Lat: {lote.coordenadas[0].latitud.toFixed(5)}, Lng: {lote.coordenadas[0].longitud.toFixed(5)}
                </div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Callout */}
        {activeCallout && <MapCallout callout={activeCallout} />}
      </MapContainer>
    </div>
  );
}
