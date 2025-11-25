// src/modules/iot/TipoSensor/ui/TipoSensorForm.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Chip,
  Card,
  CardBody,
  Tooltip,
  Select,
  SelectItem,
} from "@heroui/react";
import type {
  CreateTipoSensorInput,
  UpdateTipoSensorInput,
  TipoSensor,
} from "../model/types";
import { UNIDADES_TIPO_SENSOR, DECIMALES_TIPO_SENSOR } from "../model/constants";
import ImagePreview from "./ImagePreview";
import type { Key, Selection } from "@react-types/shared";

export type TipoSensorFormValues = CreateTipoSensorInput;

const isValidRemotePath = (s: string) =>
  /^(https?:\/\/)/i.test(s) || /^\/?uploads\//i.test(s);

// Lo que <Select> espera: Iterable<Key> | "all" | undefined
const asKeys = (v?: string | null): Iterable<Key> | undefined =>
  v ? (new Set<Key>([v as Key]) as Iterable<Key>) : undefined;

export default function TipoSensorForm({
  open,
  onClose,
  onSubmit,
  initial,
  submitting = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TipoSensorFormValues) => void;
  initial?: Partial<TipoSensor> | null;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<TipoSensorFormValues>({
    nombre_tipo_sensor: "",
    unidades_tipo_sensor: undefined,
    decimales_tipo_sensor: undefined,
    imagen_tipo_sensor: null,
  });

  const [fileObj, setFileObj] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues({
      nombre_tipo_sensor: initial?.nombre_tipo_sensor || "",
      unidades_tipo_sensor: (initial?.unidades_tipo_sensor as any) || undefined,
      decimales_tipo_sensor: (initial?.decimales_tipo_sensor as any) ?? undefined,
      imagen_tipo_sensor: null,
    });
    setFileObj(null);
    const initialImg =
      typeof initial?.imagen_tipo_sensor === "string" ? initial.imagen_tipo_sensor : "";
    setImageUrl(initialImg);
    setUrlError(null);
  }, [open, initial]);

  const imagePreviewSrc = useMemo(() => {
    if (fileObj) return fileObj as unknown as File;
    if (imageUrl?.trim()) return imageUrl.trim();
    return (typeof initial?.imagen_tipo_sensor === "string"
      ? initial?.imagen_tipo_sensor
      : null) as string | null;
  }, [fileObj, imageUrl, initial?.imagen_tipo_sensor]);

  function handleChange<K extends keyof TipoSensorFormValues>(key: K, v: any) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  const triggerFile = () => fileInputRef.current?.click();

  const clearImage = () => {
    setFileObj(null);
    setImageUrl("");
    setUrlError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  function submit() {
    const url = imageUrl.trim();
    const payload: CreateTipoSensorInput | UpdateTipoSensorInput = {
      ...values,
      imagen_tipo_sensor: fileObj
        ? fileObj
        : url && isValidRemotePath(url)
        ? url
        : undefined,
    };
    onSubmit(payload as CreateTipoSensorInput);
  }

  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => !v && onClose()}
      size="3xl"
      scrollBehavior="inside"
      classNames={{ base: "max-h-[85vh]", body: "gap-5" }}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">
          {initial?.id_tipo_sensor_pk ? "Editar tipo de sensor" : "Nuevo tipo de sensor"}
        </ModalHeader>

        <ModalBody>
          {/* Layout: izquierda (3 campos) / derecha (imagen) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* IZQUIERDA (2/3) */}
            <div className="md:col-span-2 space-y-5">
              <Input
                label="Nombre"
                labelPlacement="outside"
                placeholder="Temperatura, Humedad, pH, Luminosidad…"
                value={values.nombre_tipo_sensor}
                onChange={(e) => handleChange("nombre_tipo_sensor", e.target.value)}
                isRequired
              />

              <Select
                label="Unidades"
                labelPlacement="outside"
                placeholder="Selecciona la unidad"
                selectedKeys={asKeys(values.unidades_tipo_sensor ?? null)}
                onSelectionChange={(keys: Selection) => {
                  const set = keys === "all" ? undefined : (keys as Set<Key>);
                  const arr = set ? Array.from(set) : [];
                  const val = (arr[0] as string) || undefined;
                  handleChange("unidades_tipo_sensor", val);
                }}
                isClearable
              >
                {UNIDADES_TIPO_SENSOR.map((u) => (
                  <SelectItem key={u}>{u}</SelectItem>
                ))}
              </Select>

              <Select
                label="Decimales"
                labelPlacement="outside"
                placeholder="Formato de decimales"
                selectedKeys={asKeys(values.decimales_tipo_sensor ?? null)}
                onSelectionChange={(keys: Selection) => {
                  const set = keys === "all" ? undefined : (keys as Set<Key>);
                  const arr = set ? Array.from(set) : [];
                  const val = (arr[0] as string) || undefined;
                  handleChange("decimales_tipo_sensor", val);
                }}
                isClearable
                description="Patrón exacto usado por el backend (0, 0.0, 0.00, …)"
              >
                {DECIMALES_TIPO_SENSOR.map((d) => (
                  <SelectItem key={d}>{d}</SelectItem>
                ))}
              </Select>
            </div>

            {/* DERECHA (1/3) */}
            <div className="md:col-span-1">
              <Card shadow="sm" className="border border-default-100 h-full">
                <CardBody className="flex flex-col gap-3">
                  <div className="text-small text-default-600">Icono / Imagen</div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="flat" size="sm" onPress={triggerFile}>
                      Elegir imagen
                    </Button>

                    <Input
                      size="sm"
                      placeholder="URL http(s) o uploads/...png"
                      value={imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImageUrl(val);
                        setUrlError(
                          val && !isValidRemotePath(val)
                            ? "Usa URL http(s) o ruta del servidor (uploads/...)."
                            : null
                        );
                        if (fileObj) setFileObj(null);
                      }}
                      isInvalid={!!urlError}
                      errorMessage={urlError || undefined}
                    />

                    {(fileObj || imageUrl) && (
                      <Tooltip content="Quitar imagen">
                        <Button size="sm" variant="light" onPress={clearImage}>
                          Limpiar
                        </Button>
                      </Tooltip>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setFileObj(f);
                      if (f) {
                        setImageUrl("");
                        setUrlError(null);
                      }
                    }}
                    aria-label="Seleccionar imagen del tipo de sensor"
                  />

                  <div className="mt-1 flex items-center justify-center">
                    <ImagePreview src={imagePreviewSrc || undefined} size={120} />
                  </div>

                  <div>
                    {fileObj ? (
                      <Chip size="sm" variant="flat">
                        {fileObj.name}
                      </Chip>
                    ) : imageUrl?.trim() ? (
                      <Chip size="sm" variant="flat">
                        Usando URL
                      </Chip>
                    ) : initial?.imagen_tipo_sensor ? (
                      <Chip size="sm" variant="flat">
                        Imagen actual
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="flat" color="warning">
                        Opcional
                      </Chip>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={submit}
            isLoading={submitting}
            isDisabled={!!urlError}
          >
            {initial?.id_tipo_sensor_pk ? "Guardar cambios" : "Crear"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
