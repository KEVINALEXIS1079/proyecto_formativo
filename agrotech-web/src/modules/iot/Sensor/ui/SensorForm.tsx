// src/modules/iot/sensores/ui/SensorForm.tsx
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import type { CreateSensorInput, Sensor } from "../model/types";
import { useLotes, useTiposSensor } from "../hooks/useSensores";

export type SensorFormValues = CreateSensorInput;

interface SensorFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SensorFormValues) => void;
  initial?: Partial<Sensor> | null;
  submitting?: boolean;
  onViewTipos: () => void | Promise<void>;
  onQuickCreateTipo: () => void;
}

export default function SensorForm({
  open,
  onClose,
  onSubmit,
  initial,
  submitting = false,
  onViewTipos,
  onQuickCreateTipo,
}: SensorFormProps) {
  const { data: tipos } = useTiposSensor();
  const { data: lotes } = useLotes();

  const [values, setValues] = useState<SensorFormValues>({
    nombre_sensor: "",
    broker_sensor: "",
    puerto_sensor: 1883,
    topico_sensor: "",
    valor_minimo_sensor: 0,
    valor_maximo_sensor: 100,
    activo: true,
    id_lote_fk: 0,
    id_tipo_sensor_fk: 0,
  });

  useEffect(() => {
    if (open) {
      setValues({
        nombre_sensor: initial?.nombre_sensor || "",
        broker_sensor: initial?.broker_sensor || "",
        puerto_sensor: initial?.puerto_sensor ?? 1883,
        topico_sensor: initial?.topico_sensor || "",
        valor_minimo_sensor: initial?.valor_minimo_sensor ?? 0,
        valor_maximo_sensor: initial?.valor_maximo_sensor ?? 100,
        activo: initial?.activo ?? true,
        id_lote_fk: (initial as any)?.lote?.id_lote_pk ?? 0,
        id_tipo_sensor_fk:
          (initial as any)?.tipo_sensor?.id_tipo_sensor_pk ?? 0,
      });
    }
  }, [open, initial]);

  function handleChange<K extends keyof SensorFormValues>(k: K, v: any) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function submit() {
    if (!values.nombre_sensor.trim()) return;
    if (!values.broker_sensor.trim()) return;
    if (!values.topico_sensor.trim()) return;
    if (!values.id_lote_fk || !values.id_tipo_sensor_fk) return;
    onSubmit(values);
  }

  // selectedKeys helpers (evitan recrear Sets dentro de JSX)
  const tipoSelected = values.id_tipo_sensor_fk
    ? new Set([String(values.id_tipo_sensor_fk)])
    : new Set<string>();
  const loteSelected = values.id_lote_fk
    ? new Set([String(values.id_lote_fk)])
    : new Set<string>();

  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => !v && onClose()}
      size="xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-w-3xl",
        header: "px-6 py-4",
        body: "px-6 py-0",
        footer: "px-6 py-4",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">
          {initial?.id_sensor_pk ? "Editar sensor" : "Nuevo sensor"}
        </ModalHeader>

        <ModalBody>
          {/* Nombre (full width) */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <Input
              size="sm"
              variant="bordered"
              label="Nombre"
              placeholder="Ej. Temperatura invernadero"
              value={values.nombre_sensor}
              onChange={(e) => handleChange("nombre_sensor", e.target.value)}
              isRequired
            />
          </div>

          {/* Fila: Tipo + acciones */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-small text-foreground-600">
                Tipo de sensor
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={onQuickCreateTipo}>
                  Nuevo tipo
                </Button>
                <Button size="sm" variant="light" onPress={onViewTipos}>
                  Ver tipos
                </Button>
              </div>
            </div>

            <Select
              size="sm"
              variant="bordered"
              placeholder="Selecciona un tipo"
              selectedKeys={tipoSelected}
              onSelectionChange={(keys) => {
                const id = Number(Array.from(keys)[0]);
                handleChange("id_tipo_sensor_fk", id);
              }}
              // Muestra un texto claro en el input cuando hay selección
              renderValue={(items) => {
                const it = items?.[0];
                return it ? it.textValue : "Selecciona un tipo";
              }}
            >
              {(tipos || []).map((t) => {
                const label =
                  `${t.nombre_tipo_sensor}` +
                  (t.unidades_tipo_sensor
                    ? ` (${t.unidades_tipo_sensor})`
                    : "");
                return (
                  <SelectItem
                    key={String(t.id_tipo_sensor_pk)}
                    textValue={label} // 👈 clave: asegura la vista previa
                  >
                    {label}
                  </SelectItem>
                );
              })}
            </Select>
          </div>

          {/* Resto de campos en 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              size="sm"
              variant="bordered"
              label="Lote"
              placeholder="Selecciona un lote"
              selectedKeys={loteSelected}
              onSelectionChange={(keys) => {
                const id = Number(Array.from(keys)[0]);
                handleChange("id_lote_fk", id);
              }}
              renderValue={(items) => {
                const it = items?.[0];
                return it ? it.textValue : "Selecciona un lote";
              }}
            >
              {(lotes || []).map((l) => {
                const label =
                  l.nombre_lote || l.codigo || `Lote ${l.id_lote_pk}`;
                return (
                  <SelectItem
                    key={String(l.id_lote_pk)}
                    textValue={label} // 👈 también aquí
                  >
                    {label}
                  </SelectItem>
                );
              })}
            </Select>

            <Input
              size="sm"
              variant="bordered"
              label="Broker"
              placeholder="mqtt://… o host"
              value={values.broker_sensor}
              onChange={(e) => handleChange("broker_sensor", e.target.value)}
            />

            <Input
              size="sm"
              variant="bordered"
              type="number"
              label="Puerto"
              value={String(values.puerto_sensor)}
              onChange={(e) =>
                handleChange("puerto_sensor", Number(e.target.value))
              }
            />

            <Input
              size="sm"
              variant="bordered"
              label="Tópico"
              placeholder="sensor/temperatura"
              value={values.topico_sensor}
              onChange={(e) => handleChange("topico_sensor", e.target.value)}
            />

            <Input
              size="sm"
              variant="bordered"
              type="number"
              label="Valor mínimo"
              value={String(values.valor_minimo_sensor)}
              onChange={(e) =>
                handleChange(
                  "valor_minimo_sensor",
                  Number((e.target as HTMLInputElement).value)
                )
              }
              description="Límite inferior del rango."
            />

            <Input
              size="sm"
              variant="bordered"
              type="number"
              label="Valor máximo"
              value={String(values.valor_maximo_sensor)}
              onChange={(e) =>
                handleChange(
                  "valor_maximo_sensor",
                  Number((e.target as HTMLInputElement).value)
                )
              }
              description="Límite superior del rango."
            />
          </div>

          {/* Switch Activo */}
          <div className="mt-2">
            <Switch
              isSelected={!!values.activo}
              onValueChange={(v) => handleChange("activo", v)}
              size="sm"
            >
              Activo
            </Switch>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button color="primary" onPress={submit} isLoading={submitting}>
            {initial?.id_sensor_pk ? "Guardar" : "Crear"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
