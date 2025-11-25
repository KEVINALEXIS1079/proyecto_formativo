 import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from "@heroui/react";
 import { useEffect, useMemo, useState } from "react";
 import { Plus, X } from "lucide-react";
import type { Epa, TipoEpaLite, TipoCultivoEpaLite, CreateEpaInput } from "../model/types";
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
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader>Crear nuevo tipo EPA</ModalHeader>
        <ModalBody className="space-y-3">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            placeholder="Ej: Enfermedad"
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
            placeholder="Descripción del tipo"
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
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader>Crear nuevo tipo cultivo EPA</ModalHeader>
        <ModalBody className="space-y-3">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            placeholder="Ej: Café"
          />
          <Textarea
            label="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
            placeholder="Descripción del cultivo"
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
        placement="top-center"
        size="xl"
      >
        <ModalContent className="md:max-w-4xl">
          <ModalHeader className="flex flex-col gap-1">
            {epa ? "Editar EPA" : "Crear nuevo EPA"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={form.nombre || ""}
                onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
                placeholder="Nombre del EPA"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo EPA</label>
                <div className="flex gap-2">
                  <Select
                    selectedKeys={new Set([selectedTipoEpaKey])}
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      setForm((s) => ({ ...s, tipoEpaId: k ? Number(k) : undefined }));
                    }}
                    placeholder="Seleccionar tipo EPA"
                    className="flex-1"
                  >
                    {tiposEpa.map((tipo) => (
                      <SelectItem key={String(tipo.id)} textValue={tipo.nombre}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button
                    isIconOnly
                    variant="flat"
                    size="sm"
                    onPress={() => setCreateTipoEpaOpen(true)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo Cultivo EPA</label>
                <div className="flex gap-2">
                  <Select
                    selectedKeys={new Set([selectedTipoCultivoEpaKey])}
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      setForm((s) => ({ ...s, tipoCultivoEpaId: k ? Number(k) : undefined }));
                    }}
                    placeholder="Seleccionar tipo cultivo"
                    className="flex-1"
                  >
                    {tiposCultivoEpa.map((tipo) => (
                      <SelectItem key={String(tipo.id)} textValue={tipo.nombre}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button
                    isIconOnly
                    variant="flat"
                    size="sm"
                    onPress={() => setCreateTipoCultivoEpaOpen(true)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Imágenes</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setForm((s) => ({ ...s, imagenes: files }));
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {form.imagenes && form.imagenes.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {form.imagenes.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Vista previa ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm((s) => ({
                                ...s,
                                imagenes: s.imagenes?.filter((_, i) => i !== index) || []
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.imagenesUrls && form.imagenesUrls.length > 0 && (
                    <div className="flex justify-center gap-2 flex-wrap">
                      <p className="text-sm text-gray-600">Imágenes existentes:</p>
                      {form.imagenesUrls.map((url, index) => (
                        <ImagePreview key={`existing-${index}`} src={url} size={100} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Textarea
                label="Descripción"
                value={form.descripcion || ""}
                onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
                placeholder="Descripción del EPA"
                minRows={3}
              />

              <Textarea
                label="Síntomas"
                value={form.sintomas || ""}
                onChange={(e) => setForm((s) => ({ ...s, sintomas: e.target.value }))}
                placeholder="Síntomas del EPA"
                minRows={3}
              />

              <Textarea
                label="Manejo/Control"
                value={form.manejoControl || ""}
                onChange={(e) => setForm((s) => ({ ...s, manejoControl: e.target.value }))}
                placeholder="Métodos de manejo y control"
                minRows={3}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Meses de riesgo</label>
                <Select
                  selectionMode="multiple"
                  selectedKeys={selectedMesesKeys}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys as Set<string>);
                    setForm((s) => ({ ...s, mesesRiesgo: selected.join(',') }));
                  }}
                  placeholder="Seleccionar meses"
                >
                  {mesesOptions.map((mes) => (
                    <SelectItem key={mes.key} textValue={mes.label}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Input
                label="Temporada"
                value={form.temporadaText || ""}
                onChange={(e) => setForm((s) => ({ ...s, temporadaText: e.target.value }))}
                placeholder="Ej: Todo el año, Primavera, etc."
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>Cancelar</Button>
            <Button
              color="primary"
              isDisabled={!canSubmit}
              onPress={() => {
                if (!canSubmit) return;
                onSubmit(form as CreateEpaInput);
              }}
            >
              {epa ? "Guardar cambios" : "Crear EPA"}
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