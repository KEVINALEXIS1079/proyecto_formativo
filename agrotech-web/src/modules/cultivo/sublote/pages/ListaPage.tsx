import { useMemo, useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { useSubloteList, useDeleteSublote } from "../hooks";
import SubloteMetrics from "../ui/SubloteMetrics";
import SubloteFilters from "../ui/SubloteFilters";
import SubloteCard from "../ui/SubloteCard";
import SubloteMapList from "../widgets/SubloteMapList";
import { loteService } from "../../lote/api/lotes.service";
import type { Sublote } from "../model/types";
import type { Lote } from "../../lote/model/types";

export default function ListaPageSublote() {
  const { sublotes, loading, error } = useSubloteList();
  const { deleteSublote } = useDeleteSublote();

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [q, setQ] = useState("");
  const [selectedLote, setSelectedLote] = useState("Todos");
  const [selectedSublote, setSelectedSublote] = useState("Todos");

  const [sublotesOrden, setSublotesOrden] = useState<Sublote[]>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [rowDelete, setRowDelete] = useState<Sublote | null>(null);

  // 🔄 Cargar lotes desde el servicio
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const data = await loteService.listLotes();
        const mapped: Lote[] = data.map((l: any) => ({
          id_lote_pk: l.id_lote_pk,
          nombre_lote: l.nombre_lote,
          area_lote: Number(l.area_lote ?? 0),
          coordenadas_lote: Array.isArray(l.coordenadas_lote)
            ? l.coordenadas_lote
                .filter(
                  (c: any) =>
                    c &&
                    typeof c.latitud_lote === "number" &&
                    typeof c.longitud_lote === "number"
                )
                .map((c: any) => ({
                  latitud_lote: Number(c.latitud_lote),
                  longitud_lote: Number(c.longitud_lote),
                }))
            : [],
          sublotes: [],
          delete_at: l.delete_at ?? null,
        }));
        setLotes(mapped);
      } catch (err) {
        console.error("❌ Error cargando lotes:", err);
      }
    };
    fetchLotes();
  }, []);

  // 📦 Sincronizar sublotes
  useEffect(() => {
    if (sublotes?.length) setSublotesOrden(sublotes);
  }, [sublotes]);

  // 🔍 Filtrado
  const filtered = useMemo(() => {
    let data = sublotesOrden;
    if (selectedLote !== "Todos") data = data.filter((x) => x.lote?.nombre_lote === selectedLote);
    if (selectedSublote !== "Todos") data = data.filter((x) => x.nombre_sublote === selectedSublote);
    if (q.trim()) {
      const keyword = q.trim().toLowerCase();
      data = data.filter((x) => x.nombre_sublote.toLowerCase().includes(keyword));
    }
    return data;
  }, [sublotesOrden, q, selectedLote, selectedSublote]);

  // 📊 Métricas
  const metrics = useMemo(() => {
    const total = filtered.length;
    const totalArea = filtered.reduce((acc, x) => acc + Number(x.area_sublote || 0), 0);
    const promedioArea = total > 0 ? totalArea / total : 0;
    return { total, totalArea, promedioArea };
  }, [filtered]);

  // ✅ Funciones de eliminación con modal
  const openDeleteConfirm = (sublote: Sublote) => {
    setRowDelete(sublote);
    setOpenDelete(true);
  };

  const submitDelete = async () => {
    if (!rowDelete) return;
    try {
      await deleteSublote(rowDelete.id_sublote_pk);
      setSublotesOrden((prev) => prev.filter((s) => s.id_sublote_pk !== rowDelete.id_sublote_pk));
    } finally {
      setOpenDelete(false);
      setRowDelete(null);
    }
  };

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

      {/* Métricas y filtros */}
      <SubloteMetrics {...metrics} />
      <SubloteFilters
        q={q}
        setQ={setQ}
        selectedLote={selectedLote}
        setSelectedLote={setSelectedLote}
        selectedSublote={selectedSublote}
        setSelectedSublote={setSelectedSublote}
        sublotes={sublotes}
      />

      {/* 🗺️ Mapa */}
      <Card className="border border-gray-200 relative z-0 overflow-hidden">
        <CardBody className="h-[200px] p-0">
          <SubloteMapList sublotes={filtered} lotes={lotes} />
        </CardBody>
      </Card>

      {/* 📋 Lista de tarjetas */}
      {loading ? (
        <p>Cargando sublotes...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>No se encontraron sublotes</CardBody>
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
      <Modal isOpen={openDelete} onOpenChange={setOpenDelete}>
        <ModalContent>
          <ModalHeader>Eliminar sublote</ModalHeader>
          <ModalBody>
            ¿Seguro que deseas eliminar el sublote <strong>{rowDelete?.nombre_sublote}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpenDelete(false)} aria-label="Cancelar eliminación">
              Cancelar
            </Button>
            <Button color="danger" onPress={submitDelete} aria-label="Confirmar eliminación">
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
