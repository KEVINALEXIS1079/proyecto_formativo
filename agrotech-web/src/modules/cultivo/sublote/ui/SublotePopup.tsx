import { getAreaOfPolygon } from "geolib";
import type { Sublote } from "../model/types";

interface Props {
  sublote: Sublote;
}

export default function SublotePopup({ sublote }: Props) {
  if (!sublote.coordenadas_sublote || sublote.coordenadas_sublote.length === 0)
    return null;

  const coords = sublote.coordenadas_sublote.filter(
    (c) =>
      c &&
      typeof c.latitud_sublote === "number" &&
      typeof c.longitud_sublote === "number"
  );

  if (coords.length === 0) return null;

  let area = 0;
  if (coords.length > 2) {
    area = getAreaOfPolygon(
      coords.map((c) => ({ latitude: c.latitud_sublote, longitude: c.longitud_sublote }))
    );
  }

  const first = coords[0];

  return (
    <div>
      <div><strong>{sublote.nombre_sublote}</strong></div>
      <div>Área: {area.toLocaleString("es-CO", { maximumFractionDigits: 2 })} m²</div>
      <div>{coords.length} puntos</div>
      <div>Lat: {first.latitud_sublote.toFixed(5)}, Lng: {first.longitud_sublote.toFixed(5)}</div>
    </div>
  );
}
