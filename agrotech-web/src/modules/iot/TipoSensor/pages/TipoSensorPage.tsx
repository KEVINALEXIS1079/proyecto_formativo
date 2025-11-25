// src/modules/iot/TipoSensor/pages/TipoSensorPage.tsx
import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";

import {
  useTipoSensorList,
  useTipoSensorDeleted,
  useCreateTipoSensor,
  useUpdateTipoSensor,
  useRemoveTipoSensor,
  useRestoreTipoSensor,
  useTipoSensorRealtime,
} from "../hooks/useTipoSensor";

import TipoSensorForm from "../ui/TipoSensorForm";
import TipoSensorTable from "../ui/TipoSensorTable";
import ConfirmDialog from "../ui/ConfirmDialog";

import type { TipoSensor, CreateTipoSensorInput } from "../model/types";

export default function TipoSensorPage() {
  // Datos y realtime
  const { data: activos, isLoading: loadingActivos } = useTipoSensorList();
  const { data: eliminados, isLoading: loadingEliminados } =
    useTipoSensorDeleted();
  useTipoSensorRealtime();

  const navigate = useNavigate();

  // Crear / Editar
  const form = useDisclosure();
  const [editing, setEditing] = useState<TipoSensor | null>(null);

  const { mutateAsync: createTS, isPending: creating } = useCreateTipoSensor();
  const { mutateAsync: updateTS, isPending: updating } = useUpdateTipoSensor();
  const { mutateAsync: removeTS, isPending: removing } = useRemoveTipoSensor();
  const { mutateAsync: restoreTS, isPending: restoring } =
    useRestoreTipoSensor();

  // Confirm dialogs
  const [toDelete, setToDelete] = useState<TipoSensor | null>(null);
  const [toRestore, setToRestore] = useState<TipoSensor | null>(null);

  function openCreate() {
    if (loadingActivos) return;
    setEditing(null);
    form.onOpen();
  }

  function openEdit(row: TipoSensor) {
    setEditing(row);
    form.onOpen();
  }

  async function handleSubmit(payload: CreateTipoSensorInput) {
    if (editing) {
      await updateTS({ id: editing.id_tipo_sensor_pk, input: payload });
    } else {
      await createTS(payload);
    }
    form.onClose();
  }

  const anyLoading =
    loadingActivos ||
    loadingEliminados ||
    creating ||
    updating ||
    removing ||
    restoring;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <Card shadow="sm">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tipos de Sensor</h2>

          {/* Botón que navega al monitoreo */}
          <Button
            color="primary"
            onPress={() => navigate("/SensoresLivePage")}
            isDisabled={anyLoading}
          >
            Ver monitoreo
          </Button>
        </CardHeader>

        <CardBody>
          <Tabs aria-label="Tabs tipo sensor" color="primary" variant="underlined">
            <Tab key="activos" title={`Activos (${activos?.length ?? 0})`}>
              <TipoSensorTable
                data={activos}
                loading={loadingActivos}
                onCreate={openCreate}
                onEdit={(row) => openEdit(row)}
                onRemove={(row) => setToDelete(row)}
              />
            </Tab>

            <Tab key="eliminados" title={`Eliminados (${eliminados?.length ?? 0})`}>
              <TipoSensorTable
                data={eliminados}
                loading={loadingEliminados}
                deleted
                onRestore={(row) => setToRestore(row)}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Formulario crear/editar */}
      <TipoSensorForm
        open={form.isOpen}
        onClose={form.onClose}
        onSubmit={handleSubmit}
        initial={editing || undefined}
        submitting={creating || updating}
      />

      {/* Confirmar eliminación */}
      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar tipo de sensor"
        message={
          toDelete
            ? `¿Eliminar "${toDelete.nombre_tipo_sensor}"? Se puede restaurar luego.`
            : ""
        }
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await removeTS(toDelete.id_tipo_sensor_pk);
          setToDelete(null);
        }}
        loading={removing}
        confirmText="Eliminar"
        confirmColor="danger"
      />

      {/* Confirmar restauración */}
      <ConfirmDialog
        open={!!toRestore}
        title="Restaurar tipo de sensor"
        message={toRestore ? `¿Restaurar "${toRestore.nombre_tipo_sensor}"?` : ""}
        onClose={() => setToRestore(null)}
        onConfirm={async () => {
          if (!toRestore) return;
          await restoreTS(toRestore.id_tipo_sensor_pk);
          setToRestore(null);
        }}
        loading={restoring}
        confirmText="Restaurar"
        confirmColor="success"
      />
    </div>
  );
}
