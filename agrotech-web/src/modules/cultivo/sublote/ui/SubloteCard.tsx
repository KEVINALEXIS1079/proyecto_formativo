// ui/SubloteCard.tsx
import { Card, CardBody, Chip, Button } from "@heroui/react";
import { Pencil, Ruler, Map as MapIcon, Navigation, Trash2, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const EDIT_PATH = (id: number) => `/sublotes/editar/${id}`;

type CoordenadaSublote = { latitud_sublote: number; longitud_sublote: number };
type Sublote = {
  id_sublote_pk: number;
  nombre_sublote: string;
  area_sublote?: number;
  coordenadas_sublote?: CoordenadaSublote[];
  lote?: { nombre_lote: string };
  cultivos?: any[];
};

type Props = {
  sublote: Sublote;
  openDeleteConfirm: (sublote: Sublote) => void;
};

export default function SubloteCard({ sublote, openDeleteConfirm }: Props) {
  const getCentro = (coordenadas: CoordenadaSublote[] = []) => {
    if (!coordenadas || coordenadas.length === 0) return { lat: 0, lng: 0 };
    const lat =
      coordenadas.reduce((acc, c) => acc + c.latitud_sublote, 0) / coordenadas.length;
    const lng =
      coordenadas.reduce((acc, c) => acc + c.longitud_sublote, 0) / coordenadas.length;
    return { lat, lng };
  };

  const centro = getCentro(sublote.coordenadas_sublote || []);

  const fmt = (n?: number) => (n != null ? n.toLocaleString("es-CO") : "—");

  const cultivos = sublote.cultivos || [];

  return (
    <Card shadow="sm" className="hover:shadow-md transition">
      <CardBody className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{sublote.nombre_sublote}</h3>
          <Chip color="warning" size="sm" variant="flat">
            Sublote
          </Chip>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm text-foreground-600">
          {sublote.lote && (
            <div className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-yellow-600" />
              Lote: {sublote.lote.nombre_lote}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-yellow-600" />
            Área: {fmt(sublote.area_sublote)} m²
          </div>
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-yellow-600" />
            {sublote.coordenadas_sublote?.length ?? 0} puntos
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-yellow-600" />
            Lat: {centro.lat.toFixed(5)}, Lng: {centro.lng.toFixed(5)}
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-yellow-600" />
            Cultivos: {cultivos.length > 0 ? cultivos.map((c: any) => c.nombre_cultivo || c.nombre).join(', ') : 'Ninguno'}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            as={Link}
            to={EDIT_PATH(sublote.id_sublote_pk)}
            size="sm"
            startContent={<Pencil className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            size="sm"
            color="danger"
            startContent={<Trash2 className="h-4 w-4" />}
            onPress={() => openDeleteConfirm(sublote)}
          >
            Borrar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
