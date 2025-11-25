// ui/LoteCard.tsx
import { Card, CardBody, Chip, Button } from "@heroui/react";
import { Pencil, Ruler, Map as MapIcon, Navigation, Trash2, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const EDIT_PATH = (id: number) => `/lotes/editar/${id}`;

type Props = {
  lote: any;
  openDeleteConfirm: (lote: any) => void;
};

export default function LoteCard({ lote, openDeleteConfirm }: Props) {
  const getCentro = (coordenadas: { latitud_lote: number; longitud_lote: number }[]) => {
    if (!coordenadas || coordenadas.length === 0) return { lat: 0, lng: 0 };
    const lat = coordenadas.reduce((acc, c) => acc + c.latitud_lote, 0) / coordenadas.length;
    const lng = coordenadas.reduce((acc, c) => acc + c.longitud_lote, 0) / coordenadas.length;
    return { lat, lng };
  };

  const centro = getCentro(lote.coordenadas_lote || []);

  const fmt = (n?: number) => (n ? n.toLocaleString("es-CO") : "—");

  const cultivos = lote.sublotes?.flatMap(s => s.cultivos || []) || [];

  return (
    <Card shadow="sm" className="hover:shadow-md transition">
      <CardBody className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{lote.nombre_lote}</h3>
          <Chip color="success" size="sm" variant="flat">Lote</Chip>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm text-foreground-600">
          <div className="flex items-center gap-2"><Ruler className="h-4 w-4 text-green-600" />Área: {fmt(lote.area_lote)} m²</div>
          <div className="flex items-center gap-2"><MapIcon className="h-4 w-4 text-green-600" />{lote.coordenadas_lote?.length ?? 0} puntos</div>
          <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-green-600" />Lat: {centro.lat.toFixed(5)}, Lng: {centro.lng.toFixed(5)}</div>
          <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" />Cultivos: {cultivos.length > 0 ? cultivos.map((c: any) => c.nombre_cultivo || c.nombre).join(', ') : 'Ninguno'}</div>
        </div>
        <div className="flex justify-end gap-2">
          <Button as={Link} to={EDIT_PATH(lote.id_lote_pk)} size="sm" startContent={<Pencil className="h-4 w-4" />}>Editar</Button>
          <Button size="sm" color="danger" startContent={<Trash2 className="h-4 w-4" />} onPress={() => openDeleteConfirm(lote)}>Borrar</Button>
        </div>
      </CardBody>
    </Card>
  );
}
