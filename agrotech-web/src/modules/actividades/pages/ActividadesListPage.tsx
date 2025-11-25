import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Textarea } from "@heroui/input";
import { useActividadesList } from "../hooks/useActividades";
import { useRemoveActividad } from "../hooks/useRemoveActividad";
import { useSubtiposList } from "../hooks/useRelatedLists";
import type { Actividad } from "../model/types";
import { uploadEvidencia } from "../api/actividades.service";
import { api } from "@/shared/api/client";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "tipoActividad", label: "Tipo" },
  { key: "lote", label: "Lote" },
  { key: "sublote", label: "Sublote" },
  { key: "cultivo", label: "Cultivo" },
  { key: "fecha", label: "Fecha" },
  { key: "fechaInicio", label: "Fecha Inicio" },
  { key: "fechaFin", label: "Fecha Fin" },
  { key: "acciones", label: "Acciones" },
];

const ROWS_PER_PAGE = 10;

export default function ActividadesListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [tipoActividadId, setTipoActividadId] = useState<number | undefined>();
  const [selectedActividadId, setSelectedActividadId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null);
  const [descripcionEvidencia, setDescripcionEvidencia] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: actividades, isLoading } = useActividadesList({
    q: q.trim() || undefined,
    page,
    limit: ROWS_PER_PAGE,
    tipoActividadId,
  });

  const { data: subtipos } = useSubtiposList();

  const removeActividad = useRemoveActividad();

  const handleAgregarEvidencia = (id: number) => {
    setSelectedActividadId(id);
    setIsModalOpen(true);
  };

  const handleSubmitEvidencia = async () => {
    if (!evidenciaFile || !selectedActividadId || !descripcionEvidencia.trim()) return;

    setIsUploading(true);
    try {
      const uploadResult = await uploadEvidencia(evidenciaFile);
      const evidenciaData = {
        nombre_evidencia: evidenciaFile.name,
        descripcion_evidencia: descripcionEvidencia,
        fecha_evidencia: new Date().toISOString().split('T')[0],
        observacion_evidencia: 'Agregada desde lista de actividades',
        img_evidencia: uploadResult.path,
        id_actividad_fk: selectedActividadId,
      };
      await api.post('/evidencias', evidenciaData);
      // TODO: Refresh the list or show success
      setIsModalOpen(false);
      setEvidenciaFile(null);
      setDescripcionEvidencia("");
    } catch (error) {
      console.error('Error uploading evidencia:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const total = actividades?.length ?? 0;
  const start = (page - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;
  const paginatedActividades = actividades?.slice(start, end) || [];
  const totalPages = Math.ceil(total / ROWS_PER_PAGE);

  const renderCell = (item: Actividad, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre ?? "N/A";
      case "tipoActividad":
        return item.tipoActividad.nombre ?? "N/A";
      case "lote":
        return item.lote?.nombre ?? "N/A";
      case "sublote":
        return item.sublote?.nombre ?? "N/A";
      case "cultivo":
        return item.cultivo?.nombre ?? "N/A";
      case "fecha":
        const date = new Date(item.fecha);
        return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('es-CO');
      case "fechaInicio":
        const startDate = new Date(item.fechaInicio);
        return isNaN(startDate.getTime()) ? "N/A" : startDate.toLocaleDateString('es-CO');
      case "fechaFin":
        const endDate = new Date(item.fechaFin);
        return isNaN(endDate.getTime()) ? "N/A" : endDate.toLocaleDateString('es-CO');
      case "acciones":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={() => navigate(`/actividades/${item.id}`)}
            >
              Ver
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="secondary"
              onPress={() => navigate(`/actividades/${item.id}/editar`)}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => {
                if (confirm("¿Está seguro de eliminar esta actividad?")) {
                  removeActividad.mutate(item.id);
                }
              }}
            >
              Eliminar
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="success"
              onPress={() => handleAgregarEvidencia(item.id)}
            >
              Agregar Evidencia
            </Button>
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Actividades</h1>
          <p className="text-sm opacity-70">Gestión de actividades de cultivo</p>
        </div>
        <Button
          color="primary"
          onPress={() => navigate("/actividades/crear")}
        >
          Crear Actividad
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Buscar actividades..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <Select
          placeholder="Seleccionar tipo de actividad"
          aria-label="Seleccionar tipo de actividad"
          selectedKeys={tipoActividadId ? [tipoActividadId.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setTipoActividadId(selected ? parseInt(selected) : undefined);
            setPage(1);
          }}
        >
          {subtipos?.map((subtipo) => (
            <SelectItem key={subtipo.id}>
              {subtipo.nombre}
            </SelectItem>
          )) || []}
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Tabla de actividades">
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={paginatedActividades} isLoading={isLoading} emptyContent="No hay actividades">
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
            showShadow
          />
        </div>
      )}

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          <ModalHeader>Agregar Evidencia</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Textarea
                label="Descripción"
                placeholder="Describe la evidencia..."
                value={descripcionEvidencia}
                onChange={(e) => setDescripcionEvidencia(e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEvidenciaFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitEvidencia}
              isLoading={isUploading}
              disabled={!evidenciaFile || !descripcionEvidencia.trim()}
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}