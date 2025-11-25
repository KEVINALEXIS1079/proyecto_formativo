import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Sublote } from "../model/types";
import type { Lote } from "../../lote/model/types";
import SublotePopup from "../ui/SublotePopup";
import LotePopup, { type LoteExistente} from "../../lote/ui/LotePopup";

interface Props {
  sublotes: Sublote[];
  lotes: Lote[];
}

const FitBoundsHandler = ({ sublotes, lotes }: Props) => {
  const map = useMap();

  useEffect(() => {
    const allCoords = [
      ...lotes.flatMap((l) => l.coordenadas_lote?.map((c) => [c.latitud_lote, c.longitud_lote])),
      ...sublotes.flatMap((s) => s.coordenadas_sublote?.map((c) => [c.latitud_sublote, c.longitud_sublote])),
    ].filter(
      (c): c is [number, number] =>
        Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number"
    );

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      const MIN_ZOOM = 17;
      map.fitBounds(bounds, { padding: [10, 10] });
      if (map.getZoom() < MIN_ZOOM) map.setZoom(MIN_ZOOM);
    }
  }, [sublotes, lotes, map]);

  return null;
};

export default function SubloteMapList({ sublotes, lotes }: Props) {
  return (
    <MapContainer
      center={[2.44, -76.61]}
      zoom={17}
      style={{ height: "100%", width: "100%" }}
      className="rounded-2xl"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

      {/* Lotes */}
      {lotes.map((lote) => {
        const coords = lote.coordenadas_lote?.map((c) => ({
          latitud: c.latitud_lote,
          longitud: c.longitud_lote,
        })) || [];

        if (coords.length < 3) return null;

        const loteSimple: LoteExistente = {
          nombre: lote.nombre_lote,
          coordenadas: coords,
        };

        return (
          <Polygon
            key={`lote-${lote.id_lote_pk}`}
            positions={coords.map((c) => [c.latitud, c.longitud] as [number, number])}
            pathOptions={{ color: "gray", fillOpacity: 0.4, weight: 1.2 }}
          >
            <Tooltip direction="top" sticky>
              <LotePopup lote={loteSimple} coords={coords} />
            </Tooltip>
          </Polygon>
        );
      })}

      {/* Sublotes */}
      {sublotes.map((sublote) => {
        const coords = sublote.coordenadas_sublote
          ?.filter((c) => c && typeof c.latitud_sublote === "number" && typeof c.longitud_sublote === "number")
          .map((c) => ({ latitud: c.latitud_sublote, longitud: c.longitud_sublote })) || [];

        if (coords.length < 3) return null;

        return (
          <Polygon
            key={`sublote-${sublote.id_sublote_pk}`}
            positions={coords.map((c) => [c.latitud, c.longitud] as [number, number])}
            pathOptions={{ color: "#059669", fillColor: "#34d399", fillOpacity: 0.6, weight: 2 }}
          >
            <Tooltip direction="top" sticky>
              <SublotePopup sublote={sublote} />
            </Tooltip>
          </Polygon>
        );
      })}

      <FitBoundsHandler sublotes={sublotes} lotes={lotes} />
    </MapContainer>
  );
}
