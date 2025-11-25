import { useState, useEffect } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { useSubloteList } from "../hooks";
import EliminarSubloteFeature from "./EliminarSubloteFeature";
import SubloteCard from "../ui/SubloteCard";
import SubloteMapList from "../widgets/SubloteMapList";
import SubloteDeleteModal from "../ui/SubloteDeleteModal";
import { FiltrarSubloteFeature } from "./FiltrarSubloteFeature";
import type { Sublote } from "../model/types";

export default function ListarSubloteFeature() {
  const { sublotes, loading, error } = useSubloteList();

  const [openDelete, setOpenDelete] = useState(false);
  const [rowDelete, setRowDelete] = useState<Sublote | null>(null);
  const [sublotesOrden, setSublotesOrden] = useState<Sublote[]>([]);
  const [filtered, setFiltered] = useState<Sublote[]>([]);

  // Inicializar orden
  useEffect(() => {
    if (sublotes.length && sublotesOrden.length === 0) setSublotesOrden(sublotes);
  }, [sublotes, sublotesOrden.length]);

  // Actualización incremental
  useEffect(() => {
    if (!sublotes.length) return;
    setSublotesOrden((prev) => {
      const idsPrev = new Set(prev.map((s) => s.id_sublote_pk));
      const nuevos = sublotes.filter((s) => !idsPrev.has(s.id_sublote_pk));
      return nuevos.length === 0 ? prev : [...prev, ...nuevos];
    });
  }, [sublotes]);

  // Sincronizar filtro base
  useEffect(() => {
    setFiltered(sublotesOrden);
  }, [sublotesOrden]);

  // Lógica de eliminación usando feature
  const { handleDelete, loading: deleting } = EliminarSubloteFeature({
    onDeleted: (id: number) =>
      setSublotesOrden((prev) => prev.filter((s) => s.id_sublote_pk !== id)),
  });

  const submitDelete = async () => {
    if (!rowDelete) return;
    await handleDelete(rowDelete);
    setOpenDelete(false);
    setRowDelete(null);
  };

  const openDeleteConfirm = (sublote: Sublote) => {
    setRowDelete(sublote);
    setOpenDelete(true);
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6 relative z-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Lista de sublotes</h2>
        <Button
          as={Link}
          to="/sublotes/crear"
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          className="shadow-sm"
          aria-label="Crear nuevo sublote"
        >
          Nuevo sublote
        </Button>
      </div>

      {/* ✅ Filtros + métricas combinadas */}
      <FiltrarSubloteFeature sublotes={sublotesOrden} onFilteredChange={setFiltered} />

      {/* 🗺️ Mapa interactivo */}
      <Card className="border border-gray-200 relative z-0 overflow-hidden">
        <CardBody className="h-[500px] p-0 rounded-lg">
          <SubloteMapList sublotes={filtered} lotes={[]} />
        </CardBody>
      </Card>

      {/* 📋 Lista de sublotes */}
      {loading ? (
        <Card>
          <CardBody>Cargando sublotes desde el servidor...</CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>No se encontraron sublotes registrados</CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((sublote) => (
            <SubloteCard
              key={sublote.id_sublote_pk}
              sublote={sublote}
              openDeleteConfirm={() => openDeleteConfirm(sublote)}
            />
          ))}
        </div>
      )}

      {/* Modal de eliminación */}
      <SubloteDeleteModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        subloteName={rowDelete?.nombre_sublote}
        onConfirm={submitDelete}
        loading={deleting}
      />
    </div>
  );
}
