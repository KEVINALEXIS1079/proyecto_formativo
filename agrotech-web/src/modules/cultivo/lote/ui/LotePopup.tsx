import { type Coordenada } from "@/modules/cultivo/lote/model/types";
import { getAreaOfPolygon } from "geolib";

// Tipo simplificado reutilizable para mostrar info de lote
export type LoteExistente = {
  nombre: string;
  coordenadas: Coordenada[];
};

type Props = {
  lote: LoteExistente;
  coords: Coordenada[];
};

export default function LotePopup({ lote, coords }: Props) {
  if (!coords || coords.length === 0) return null;

  const first = coords[0];
  let area = 0;
  if (coords.length > 2) {
    area = getAreaOfPolygon(
      coords.map((c) => ({ latitude: c.latitud, longitude: c.longitud }))
    );
  }

  return (
    <div className="text-sm">
      <div>
        <strong>{lote.nombre}</strong>
      </div>
      <div>
        Área: {area.toLocaleString("es-CO", { maximumFractionDigits: 2 })} m²
      </div>
      <div>{coords.length} puntos</div>
      <div>
        Lat: {first.latitud.toFixed(5)}, Lng: {first.longitud.toFixed(5)}
      </div>
    </div>
  );
}
