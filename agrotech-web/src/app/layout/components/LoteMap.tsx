import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Coordenada {
  latitud: number;
  longitud: number;
}

interface LoteMapProps {
  mode?: "polygon" | "picker"; // modo: polígono o selección única
  coordinates?: Coordenada[];
  loteName?: string;
  onChange?: (coords: Coordenada[]) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function LoteMap({
  mode = "polygon",
  coordinates = [],
  loteName = "Lote sin nombre",
  onChange,
  height = "400px",
  center = [1.8928, -76.091],
  zoom = 18,
}: LoteMapProps) {
  const [coords, setCoords] = useState<Coordenada[]>(coordinates);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (mode === "picker") {
          const punto = { latitud: lat, longitud: lng };
          setCoords([punto]);
          onChange?.([punto]);
        } else {
          const nuevos = [...coords, { latitud: lat, longitud: lng }];
          setCoords(nuevos);
          onChange?.(nuevos);
        }
      },
    });
    return null;
  }

  function handleRemovePoint(index: number) {
    const nuevos = coords.filter((_, i) => i !== index);
    setCoords(nuevos);
    onChange?.(nuevos);
  }

  return (
    <div style={{ height, width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <MapClickHandler />

        {/* Modo picker (solo 1 punto) */}
        {mode === "picker" && coords.length > 0 && (
          <Marker position={[coords[0].latitud, coords[0].longitud]}>
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent>
              <div>
                📍 <b>{loteName}</b>
                <br />
                Lat: {coords[0].latitud.toFixed(6)}
                <br />
                Lng: {coords[0].longitud.toFixed(6)}
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* Modo polígono */}
        {mode === "polygon" && coords.length > 0 && (
          <>
            <Polygon
              positions={coords.map((c) => [c.latitud, c.longitud])}
              pathOptions={{ color: "green", weight: 2, fillOpacity: 0.3 }}
            >
              <Tooltip direction="top" opacity={0.9} permanent>
                🟢 <b>{loteName}</b>
              </Tooltip>
            </Polygon>

            {coords.map((c, i) => (
              <Marker
                key={i}
                position={[c.latitud, c.longitud]}
                eventHandlers={{
                  contextmenu: () => handleRemovePoint(i), // clic derecho elimina
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent>
                  <div>
                    <b>Punto {i + 1}</b>
                    <br />
                    Lat: {c.latitud.toFixed(6)}
                    <br />
                    Lng: {c.longitud.toFixed(6)}
                    <br />
                    🗑️ Clic derecho para eliminar
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}
