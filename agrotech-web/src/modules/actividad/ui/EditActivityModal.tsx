import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  // ModalFooter removed
} from "@heroui/react";
import ActividadForm from "./ActividadForm";
import type { CreateActividadPayload } from "../models/types";
import { useUpdateActividad } from "../hooks/useActividades";
import toast from "react-hot-toast";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  actividad: any | null;
}

function mapActividadToForm(actividad: any): Partial<CreateActividadPayload> {
  if (!actividad) return {};
  return {
    nombre: actividad.nombre,
    tipo: actividad.tipo,
    subtipo: actividad.subtipo,
    cultivoId: actividad.cultivoId,
    loteId: actividad.loteId || actividad.lote?.id,
    subLoteId: actividad.subLoteId || actividad.subLote?.id,
    fecha: actividad.fecha ? actividad.fecha.substring(0, 10) : "",
    descripcion: actividad.descripcion,
    estado: actividad.estado,
    horasActividad: actividad.horasActividad,
    precioHoraActividad: actividad.precioHoraActividad,
    responsables: actividad.responsables?.map((r: any) => ({
      usuarioId: r.usuarioId ?? r.usuario?.id,
      horas: r.horas,
      precioHora: r.precioHora,
    })),
    insumos: (actividad.insumosReserva?.length > 0 ? actividad.insumosReserva : actividad.insumosUso)?.map((i: any) => ({
      insumoId: i.insumoId ?? i.insumo?.id,
      cantidadUso: i.cantidadReservada ?? i.cantidadUso,
      costoUnitarioUso: i.costoUnitarioUso ?? 0,
      descripcion: i.descripcion || "",
    })),
    servicios: actividad.servicios?.map((s: any) => ({
      nombreServicio: s.nombreServicio,
      horas: s.horas,
      precioHora: s.precioHora,
    })),
    herramientas: actividad.herramientas?.map((h: any) => ({
      activoFijoId: h.activoFijoId,
      horasUso: h.horasEstimadas,
    })),
    // New fields mapping
    cantidadPlantas: actividad.cantidadPlantas,
    kgRecolectados: actividad.kgRecolectados,
  };
}

export default function EditActivityModal({ isOpen, onClose, actividad }: EditActivityModalProps) {
  const updateMutation = useUpdateActividad();

  const handleSubmit = async (data: CreateActividadPayload) => {
    if (!actividad) return;
    try {
      await updateMutation.mutateAsync({ id: actividad.id, data: { ...data, estado: data.estado || actividad.estado } });
      toast.success("Actividad actualizada");
      onClose();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Error al actualizar la actividad";
      toast.error(errorMessage);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside" isDismissable={false}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Editar actividad</ModalHeader>
            <ModalBody>
              <ActividadForm
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
                submitLabel="Guardar cambios"
                initialData={mapActividadToForm(actividad)}
                onCancel={onClose}
              />
            </ModalBody>
            {/* Footer removed */}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
