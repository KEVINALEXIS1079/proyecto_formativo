import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, Tooltip } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import type { Epa, TipoEpaLite, TipoCultivoEpaLite, CreateEpaInput } from "../models/types";
import { useTipoEpaList, useCreateTipoEpa } from "../hooks/useFitosanitario";
import { useTipoCultivoEpaList, useCreateTipoCultivoEpa } from "../hooks/useFitosanitario";
import ImagePreview from "../../iot/TipoSensor/ui/ImagePreview";

// Modal para crear nuevo tipo EPA
function CreateTipoEpaModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tipo: TipoEpaLite) => void;
}) {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const createMutation = useCreateTipoEpa();

  const canSubmit = form.nombre.trim().length > 0 && form.descripcion.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const result = await createMutation.mutateAsync({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        tipoEpaEnum: "enfermedad", // default
      });
      onSuccess({ id: result.id, nombre: result.nombre });
      setForm({ nombre: "", descripcion: "" });
      onClose();
    } catch (error) {
      console.error("Error creando tipo EPA:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md" backdrop="blur">
      <ModalContent>
        <ModalHeader>Crear nuevo tipo EPA</ModalHeader>
        <ModalBody className="space-y-3">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            placeholder="Ej: Enfermedad"
            variant="bordered"
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
            placeholder="Descripción del tipo"
            variant="bordered"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancelar</Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={createMutation.isPending}
            isDisabled={!canSubmit}
          >
            Crear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Modal para crear nuevo tipo cultivo EPA
function CreateTipoCultivoEpaModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tipo: TipoCultivoEpaLite) => void;
}) {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const createMutation = useCreateTipoCultivoEpa();

  const canSubmit = form.nombre.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const result = await createMutation.mutateAsync({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion || undefined,
      });
      onSuccess({ id: result.id, nombre: result.nombre });
      setForm({ nombre: "", descripcion: "" });
      onClose();
    } catch (error) {
      console.error("Error creando tipo cultivo EPA:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md" backdrop="blur">
      <ModalContent>
        <ModalHeader>Crear nuevo tipo cultivo EPA</ModalHeader>
        <ModalBody className="space-y-3">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            placeholder="Ej: Café"
            variant="bordered"
          />
          <Textarea
            label="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
            placeholder="Descripción del cultivo"
            variant="bordered"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancelar</Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={createMutation.isPending}
            isDisabled={!canSubmit}
          >
            Crear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function EpaForm({
  epa,
  isOpen,
  onClose,
  onSubmit,
}: {
  epa: Epa | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateEpaInput) => void;
}) {
  const [form, setForm] = useState<Partial<CreateEpaInput>>({
    nombre: "",
    descripcion: "",
    estado: "presente",
    tipoEpaId: undefined,
    tipoCultivoEpaId: undefined,
    sintomas: "",
    manejoControl: "",
    mesesRiesgo: "",
    temporadaText: "",
    imagenesUrls: [],
    imagenes: [],
  });

  const [createTipoEpaOpen, setCreateTipoEpaOpen] = useState(false);
  const [createTipoCultivoEpaOpen, setCreateTipoCultivoEpaOpen] = useState(false);

  const { data: tiposEpa = [] } = useTipoEpaList();
  const { data: tiposCultivoEpa = [] } = useTipoCultivoEpaList();

  // Sincronizar formulario cuando cambie epa
  useEffect(() => {
    if (epa) {
      setForm({
        nombre: epa.nombre,
        descripcion: epa.descripcion,
        estado: epa.estado,
        tipoEpaId: epa.tipoEpa.id,
        tipoCultivoEpaId: epa.tipoCultivoEpa.id,
        sintomas: epa.sintomas || "",
        manejoControl: epa.manejoControl || "",
        mesesRiesgo: epa.mesesRiesgo || "",
        temporadaText: epa.temporadaText || "",
        imagenesUrls: epa.imagenesUrls || [],
        imagenes: [], // No hay archivos al editar
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        estado: "presente",
        tipoEpaId: undefined,
        tipoCultivoEpaId: undefined,
        sintomas: "",
        manejoControl: "",
        mesesRiesgo: "",
        temporadaText: "",
        imagenesUrls: [],
        imagenes: [],
      });
    }
  }, [epa]);

  const canSubmit = useMemo(() => {
    return (
      (form.nombre?.trim()?.length || 0) > 0 &&
      (form.descripcion?.trim()?.length || 0) > 0 &&
      form.tipoEpaId &&
      form.tipoCultivoEpaId
    );
  }, [form]);

  const selectedTipoEpaKey = String(form.tipoEpaId || "");
  const selectedTipoCultivoEpaKey = String(form.tipoCultivoEpaId || "");

  const mesesOptions = Array.from({ length: 12 }, (_, i) => ({
    key: String(i + 1),
    label: new Date(0, i).toLocaleString('es', { month: 'long' }),
  }));

  const selectedMesesKeys = new Set(
    form.mesesRiesgo?.split(',').map(m => m.trim()).filter(Boolean) || []
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose(); }}
        placement="center"
        size="3xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          body: "py-6",
          backdrop: "bg-black/50 backdrop-opacity-40",
          base: "border border-default-100 shadow-xl dark:bg-zinc-900",
          header: "border-b border-default-100",
          footer: "border-t border-default-100",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">{epa ? "Editar Fitosanitario" : "Nuevo Registro Fitosanitario"}</h2>
            <p className="text-sm text-default-500 font-normal">
              {epa ? "Actualiza la información del registro existente." : "Completa la información para registrar una nueva enfermedad, plaga o arvense."}
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Info Básica */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
                  Información General
                </h3>
                
                <Input
                  label="Nombre"
                  value={form.nombre || ""}
                  onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
                  placeholder="Nombre común"
                  variant="bordered"
                  isRequired
                />

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <div className="flex gap-2 items-end">
                        <Select
                            label="Tipo"
                            selectedKeys={new Set([selectedTipoEpaKey])}
                            onSelectionChange={(keys) => {
                            const k = Array.from(keys as Set<string>)[0];
                            setForm((s) => ({ ...s, tipoEpaId: k ? Number(k) : undefined }));
                            }}
                            placeholder="Seleccionar"
                            variant="bordered"
                            isRequired
                        >
                            {tiposEpa.map((tipo) => (
                            <SelectItem key={String(tipo.id)} textValue={tipo.nombre}>
                                {tipo.nombre}
                            </SelectItem>
                            ))}
                        </Select>
                        <Tooltip content="Crear nuevo tipo">
                            <Button
                                isIconOnly
                                variant="flat"
                                className="h-14 w-14 min-w-10"
                                onPress={() => setCreateTipoEpaOpen(true)}
                            >
                                <Plus size={20} />
                            </Button>
                        </Tooltip>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex gap-2 items-end">
                        <Select
                            label="Cultivo Afectado"
                            selectedKeys={new Set([selectedTipoCultivoEpaKey])}
                            onSelectionChange={(keys) => {
                            const k = Array.from(keys as Set<string>)[0];
                            setForm((s) => ({ ...s, tipoCultivoEpaId: k ? Number(k) : undefined }));
                            }}
                            placeholder="Seleccionar"
                            variant="bordered"
                            isRequired
                        >
                            {tiposCultivoEpa.map((tipo) => (
                            <SelectItem key={String(tipo.id)} textValue={tipo.nombre}>
                                {tipo.nombre}
                            </SelectItem>
                            ))}
                        </Select>
                        <Tooltip content="Crear nuevo cultivo">
                            <Button
                                isIconOnly
                                variant="flat"
                                className="h-14 w-14 min-w-10"
                                onPress={() => setCreateTipoCultivoEpaOpen(true)}
                            >
                                <Plus size={20} />
                            </Button>
                        </Tooltip>
                        </div>
                    </div>
                </div>

                <Textarea
                  label="Descripción"
                  value={form.descripcion || ""}
                  onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
                  placeholder="Descripción general y características principales"
                  minRows={3}
                  variant="bordered"
                  isRequired
                />

                <Textarea
                  label="Síntomas"
                  value={form.sintomas || ""}
                  onChange={(e) => setForm((s) => ({ ...s, sintomas: e.target.value }))}
                  placeholder="Signos visibles y síntomas en la planta"
                  minRows={3}
                  variant="bordered"
                />
              </div>

              {/* Columna Derecha: Detalles y Multimedia */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
                    Detalles y Multimedia
                </h3>

                <Textarea
                  label="Manejo y Control"
                  value={form.manejoControl || ""}
                  onChange={(e) => setForm((s) => ({ ...s, manejoControl: e.target.value }))}
                  placeholder="Métodos de prevención y tratamiento"
                  minRows={3}
                  variant="bordered"
                />

                <div className="grid grid-cols-2 gap-3">
                    <Select
                    label="Meses de Riesgo"
                    selectionMode="multiple"
                    selectedKeys={selectedMesesKeys}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys as Set<string>);
                        setForm((s) => ({ ...s, mesesRiesgo: selected.join(',') }));
                    }}
                    placeholder="Seleccionar meses"
                    variant="bordered"
                    >
                    {mesesOptions.map((mes) => (
                        <SelectItem key={mes.key} textValue={mes.label}>
                        {mes.label}
                        </SelectItem>
                    ))}
                    </Select>

                    <Input
                    label="Temporada"
                    value={form.temporadaText || ""}
                    onChange={(e) => setForm((s) => ({ ...s, temporadaText: e.target.value }))}
                    placeholder="Ej: Época de lluvias"
                    variant="bordered"
                    />
                </div>

                {/* Zona de carga de imágenes mejorada */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-default-700">Imágenes de referencia</label>
                  <div className="border-2 border-dashed border-default-300 rounded-xl p-4 hover:bg-default-50 transition-colors text-center cursor-pointer relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm((s) => ({ ...s, imagenes: [...(s.imagenes || []), ...files] }));
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 text-default-500">
                        <Upload size={24} />
                        <span className="text-sm">Arrastra imágenes o haz clic para subir</span>
                    </div>
                  </div>
                  
                  {/* Previsualización de imágenes */}
                  {(form.imagenes?.length || 0) > 0 || (form.imagenesUrls?.length || 0) > 0 ? (
                    <div className="flex gap-2 overflow-x-auto py-2 pb-1">
                      {/* Imágenes existentes */}
                      {form.imagenesUrls?.map((url, index) => (
                        <div key={`url-${index}`} className="relative flex-shrink-0 group">
                            <ImagePreview src={url} size={80} />
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Aquí se podría agregar botón para eliminar imagen existente si el backend lo soporta */}
                            </div>
                        </div>
                      ))}
                      
                      {/* Nuevas imágenes */}
                      {form.imagenes?.map((file, index) => (
                        <div key={`file-${index}`} className="relative flex-shrink-0 w-20 h-20 group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index}`}
                            className="w-full h-full object-cover rounded-lg border border-default-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm((s) => ({
                                ...s,
                                imagenes: s.imagenes?.filter((_, i) => i !== index) || []
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 shadow-md hover:bg-danger-600 transition-colors z-20"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancelar</Button>
            <Button
              color="primary"
              isDisabled={!canSubmit}
              isLoading={false} // Se podría pasar prop isLoading si se desea
              onPress={() => {
                if (!canSubmit) return;
                onSubmit(form as CreateEpaInput);
              }}
              className="px-6 font-medium"
            >
              {epa ? "Guardar Cambios" : "Crear Registro"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CreateTipoEpaModal
        isOpen={createTipoEpaOpen}
        onClose={() => setCreateTipoEpaOpen(false)}
        onSuccess={(tipo) => {
          setForm((s) => ({ ...s, tipoEpaId: tipo.id }));
        }}
      />

      <CreateTipoCultivoEpaModal
        isOpen={createTipoCultivoEpaOpen}
        onClose={() => setCreateTipoCultivoEpaOpen(false)}
        onSuccess={(tipo) => {
          setForm((s) => ({ ...s, tipoCultivoEpaId: tipo.id }));
        }}
      />
    </>
  );
}