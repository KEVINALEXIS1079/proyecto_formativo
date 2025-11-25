import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Textarea } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLotesList, useSublotesList } from "../hooks/useLotes";
import { useTiposCultivoList, useTipoCultivoCreate } from "../hooks/useTiposCultivo";
import { useCultivoCreate, useCultivoUpdate } from "../hooks/useCultivos";
import type { Cultivo, CreateCultivoInput, UpdateCultivoInput } from "../model/types";
import { Sprout, MapPin, ImageIcon as Image, FileText, Settings } from "lucide-react";

interface CultivoFormProps {
  cultivo?: Cultivo | null;
  onSuccess?: () => void;
}

export default function CultivoForm({ cultivo, onSuccess }: CultivoFormProps) {
  const navigate = useNavigate();
  const isEdit = !!cultivo;

  const [form, setForm] = useState<Partial<CreateCultivoInput & UpdateCultivoInput>>({
    nombre: cultivo?.nombre || "",
    descripcion: cultivo?.descripcion || "",
    idTipoCultivo: cultivo?.idTipoCultivo,
    idSublote: cultivo?.idSublote,
    img: null,
    estado: cultivo?.estado,
  });

  const [selectedLoteId, setSelectedLoteId] = useState<number | undefined>(cultivo?.sublote?.idLote);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipoName, setModalTipoName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(cultivo?.imagen || null);

  const { data: tiposCultivo = [] } = useTiposCultivoList();
  const { data: lotes = [] } = useLotesList();
  const { data: sublotes = [] } = useSublotesList(selectedLoteId || 0);

  const createMutation = useCultivoCreate();
  const updateMutation = useCultivoUpdate();
  const createTipoMutation = useTipoCultivoCreate();

  // Sincronizar formulario
  useEffect(() => {
    if (cultivo) {
      setForm({
        nombre: cultivo.nombre,
        descripcion: cultivo.descripcion || "",
        idTipoCultivo: cultivo.idTipoCultivo,
        idSublote: cultivo.idSublote,
        img: null,
        estado: cultivo.estado,
      });
      setSelectedLoteId(cultivo.sublote?.idLote);
      setImagePreview(cultivo.imagen || null);
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        idTipoCultivo: undefined,
        idSublote: undefined,
        img: null,
      });
      setSelectedLoteId(undefined);
      setImagePreview(null);
    }
  }, [cultivo]);

  const canSubmit = useMemo(() => {
    return (
      (form.nombre?.trim()?.length || 0) > 0 &&
      !!form.idTipoCultivo
    );
  }, [form]);

  const estadoOptions = [
    { key: "activo", label: "Activo" },
    { key: "inactivo", label: "Inactivo" },
  ];

  const tipoCultivoOptions = tiposCultivo.map((t: { id: number; nombre: string }) => ({ key: String(t.id), label: t.nombre }));
  const loteOptions = lotes.map((l: { id: number; nombre: string }) => ({ key: String(l.id), label: l.nombre }));
  const subloteOptions = sublotes.map((s: { id: number; nombre: string }) => ({ key: String(s.id), label: s.nombre }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (isEdit && cultivo) {
        await updateMutation.mutateAsync({ id: cultivo.id, dto: form as UpdateCultivoInput });
      } else {
        await createMutation.mutateAsync(form as CreateCultivoInput);
      }
      onSuccess?.();
      navigate("/cultivos");
    } catch (error) {
      console.error("Error guardando cultivo:", error);
    }
  };
return (
  <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-8">
    <div className="flex items-center gap-3">
      <Sprout className="w-8 h-8 text-green-600" />
      <h2 className="text-3xl font-bold text-gray-800">{isEdit ? "Editar cultivo" : "Crear nuevo cultivo"}</h2>
    </div>

    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><Sprout className="w-5 h-5" /> Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            startContent={<Sprout className="w-4 h-4 text-gray-500" />}
            label="Nombre"
            value={form.nombre || ""}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            placeholder="Nombre del cultivo"
            required
          />

          <div className="flex gap-2 items-end">
            <Select
              startContent={<Settings className="w-4 h-4 text-gray-500" />}
              label="Tipo de cultivo"
              selectedKeys={new Set(form.idTipoCultivo ? [String(form.idTipoCultivo)] : [])}
              onSelectionChange={(keys) => {
                const k = Array.from(keys as Set<string>)[0];
                setForm((s) => ({ ...s, idTipoCultivo: k ? Number(k) : undefined }));
              }}
              placeholder="Seleccionar tipo de cultivo"
              required
              className="flex-1"
            >
              {tipoCultivoOptions.map((opt: { key: string; label: string }) => (
                <SelectItem key={opt.key} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
            <Button variant="flat" onPress={() => setIsModalOpen(true)}>Crear nuevo</Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Ubicación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            startContent={<MapPin className="w-4 h-4 text-gray-500" />}
            label="Lote"
            selectedKeys={new Set(selectedLoteId ? [selectedLoteId.toString()] : [])}
            onSelectionChange={(keys) => {
              const k = Array.from(keys as Set<string>)[0];
              const newLoteId = k ? Number(k) : undefined;
              setSelectedLoteId(newLoteId);
              setForm((s) => ({ ...s, idSublote: undefined })); // Reset sublote
            }}
            placeholder="Seleccionar lote"
          >
            {loteOptions.map((opt: { key: string; label: string }) => (
              <SelectItem key={opt.key} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            startContent={<MapPin className="w-4 h-4 text-gray-500" />}
            label="Sublote"
            selectedKeys={new Set(form.idSublote ? [String(form.idSublote)] : [])}
            onSelectionChange={(keys) => {
              const k = Array.from(keys as Set<string>)[0];
              setForm((s) => ({ ...s, idSublote: k ? Number(k) : undefined }));
            }}
            placeholder="Seleccionar sublote"
            isDisabled={!selectedLoteId}
          >
            {subloteOptions.map((opt: { key: string; label: string }) => (
              <SelectItem key={opt.key} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><Image className="w-5 h-5" /> Imagen</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Imagen (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setForm((s) => ({ ...s, img: file }));
              setImagePreview(file ? URL.createObjectURL(file) : null);
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Vista previa" className="mt-2 max-w-xs h-auto rounded shadow" />
          )}
        </div>
      </div>

      {isEdit && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><Settings className="w-5 h-5" /> Estado</h3>
          <Select
            startContent={<Settings className="w-4 h-4 text-gray-500" />}
            label="Estado"
            selectedKeys={new Set([form.estado || ""])}
            onSelectionChange={(keys) => {
              const k = Array.from(keys as Set<string>)[0];
              setForm((s) => ({ ...s, estado: k as "activo" | "inactivo" }));
            }}
            placeholder="Seleccionar estado"
          >
            {estadoOptions.map((opt) => (
              <SelectItem key={opt.key} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Descripción</h3>
        <Textarea
          label="Descripción (opcional)"
          value={form.descripcion || ""}
          onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
          placeholder="Descripción del cultivo"
          minRows={3}
          className="max-h-32 overflow-y-auto resize-none"
        />
      </div>
    </div>

    <div className="flex justify-end gap-3 pt-6">
      <Button variant="flat" onPress={() => navigate("/cultivos")}>
        Cancelar
      </Button>
      <Button
        color="primary"
        onPress={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending || createTipoMutation.isPending}
        isDisabled={!canSubmit}
      >
        {isEdit ? "Guardar cambios" : "Crear cultivo"}
      </Button>
    </div>

    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Crear nuevo tipo de cultivo</ModalHeader>
            <ModalBody>
              <Input
                label="Nombre"
                value={modalTipoName}
                onChange={(e) => setModalTipoName(e.target.value)}
                placeholder="Nombre del tipo de cultivo"
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Cancelar</Button>
              <Button
                color="primary"
                onPress={async () => {
                  if (!modalTipoName.trim()) return;
                  try {
                    const newTipo = await createTipoMutation.mutateAsync({ nombre: modalTipoName });
                    setForm((s) => ({ ...s, idTipoCultivo: newTipo.id }));
                    setModalTipoName("");
                    onClose();
                  } catch (error) {
                    console.error("Error creando tipo:", error);
                  }
                }}
                isLoading={createTipoMutation.isPending}
                isDisabled={!modalTipoName.trim()}
              >
                Crear
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </div>
);
}