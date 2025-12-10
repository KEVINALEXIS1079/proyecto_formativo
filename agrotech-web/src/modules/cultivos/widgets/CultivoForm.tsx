import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, MapPin, ImageIcon as Image, FileText, Settings, Plus } from "lucide-react";
import { useLotesList, useSublotesList } from "../hooks/useLotes";
import { useCultivoCreate, useCultivoUpdate } from "../hooks/useCultivos";
import { useTipoCultivoCreate, useTiposCultivoList } from "../hooks/useTiposCultivo";
import type { CreateCultivoInput, Cultivo, UpdateCultivoInput } from "../model/types";
import { toast } from "react-toastify";

interface CultivoFormProps {
  cultivo?: Cultivo | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  redirectOnSuccess?: boolean;
  readOnly?: boolean;
  onToggleEdit?: () => void;
}

export default function CultivoForm({ cultivo, onSuccess, onCancel, redirectOnSuccess = true, readOnly = false, onToggleEdit }: CultivoFormProps) {
  const navigate = useNavigate();
  const isEdit = !!cultivo;

  const [form, setForm] = useState<Partial<CreateCultivoInput & UpdateCultivoInput>>({
    nombre: cultivo?.nombre || "",
    descripcion: cultivo?.descripcion || "",
    idTipoCultivo: cultivo?.idTipoCultivo,
    tipoCultivo: typeof cultivo?.tipoCultivo === "string" ? cultivo?.tipoCultivo : (cultivo?.tipoCultivo as any)?.nombre,
    idLote: cultivo?.idLote,
    idSublote: cultivo?.idSublote,
    img: null,
    estado: cultivo?.estado,
  });

  const [selectedLoteId, setSelectedLoteId] = useState<number | undefined>(cultivo?.idLote ?? cultivo?.sublote?.idLote);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipoName, setModalTipoName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(cultivo?.imagen || null);
  const [showMotivo, setShowMotivo] = useState(false);
  const [motivoCambio, setMotivoCambio] = useState("");

  const { data: tiposCultivo = [] } = useTiposCultivoList();
  const { data: lotes = [] } = useLotesList();
  // Cargar sublotes en base al lote conocido (sin referenciar sublotes antes de declararlos)
  const fetchLoteId =
    selectedLoteId ||
    form.idLote ||
    cultivo?.sublote?.idLote ||
    (cultivo as any)?.subLote?.idLote ||
    0;
  const { data: sublotes = [] } = useSublotesList(fetchLoteId);

  // Si tenemos sublote seleccionado, sincronizar lote cuando lleguen los datos
  useEffect(() => {
    if (form.idSublote) {
      const found = sublotes.find((s: any) => s.id === form.idSublote);
      if (found?.idLote) {
        setForm((prev) => ({ ...prev, idLote: prev.idLote ?? found.idLote }));
        setSelectedLoteId((prev) => prev ?? found.idLote);
      }
    }
  }, [form.idSublote, sublotes]);

  // Si el lote seleccionado no tiene sublotes, limpiar sublote
  useEffect(() => {
    if (!selectedLoteId) return;
    const hasSub = sublotes.length > 0;
    if (!hasSub && form.idSublote !== undefined) {
      setForm((s) => ({ ...s, idSublote: null }));
    }
  }, [selectedLoteId, sublotes, form.idSublote]);

  const createMutation = useCultivoCreate();
  const updateMutation = useCultivoUpdate();
  const createTipoMutation = useTipoCultivoCreate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    navigate("/cultivos");
  };

  useEffect(() => {
    if (cultivo) {
      setForm({
        nombre: cultivo.nombre,
        descripcion: cultivo.descripcion || "",
        idTipoCultivo: cultivo.idTipoCultivo,
        idLote: cultivo.idLote ?? cultivo.sublote?.idLote,
        idSublote: cultivo.idSublote,
        img: null,
        estado: cultivo.estado,
      });
      setSelectedLoteId(cultivo.idLote ?? cultivo.sublote?.idLote);
      setImagePreview(cultivo.imagen || null);
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        idTipoCultivo: undefined,
        idLote: undefined,
        idSublote: undefined,
        img: null,
      });
      setSelectedLoteId(undefined);
      setImagePreview(null);
    }
  }, [cultivo]);

  const canSubmit = useMemo(() => {
    const hasNombre = (form.nombre?.trim()?.length || 0) > 0;
    const hasTipo = !!form.tipoCultivo;
    const hasUbicacion = !!form.idSublote || !!form.idLote || !!selectedLoteId;
    return hasNombre && hasTipo && hasUbicacion;
  }, [form, selectedLoteId]);

  const estadoOptions = [
    { key: "activo", label: "Activo" },
    { key: "inactivo", label: "Inactivo" },
    { key: "finalizado", label: "Finalizado" },
  ];

  const tipoCultivoOptions = tiposCultivo.map((t: { id: number; nombre: string }) => ({ key: String(t.id), label: t.nombre }));
  const loteOptions = lotes.map((l: { id: number; nombre: string }) => ({ key: String(l.id), label: l.nombre }));
  const subloteOptions = sublotes.map((s: { id: number; nombre: string }) => ({ key: String(s.id), label: s.nombre }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const payload = {
      ...form,
      nombre: form.nombre?.trim() || "",
      tipoCultivo: form.tipoCultivo,
      // Si hay sublote, enviamos sólo sublote (backend exige XOR). Si se limpió, mandamos null.
      idSublote: form.idSublote ?? null,
      idLote: form.idSublote ? undefined : form.idLote ?? selectedLoteId,
    } as CreateCultivoInput;
    if (isEdit) {
      setShowMotivo(true);
      return;
    }
    try {
      await createMutation.mutateAsync(payload);
      onSuccess?.();
      if (redirectOnSuccess) navigate("/cultivos");
    } catch (error) {
      console.error("Error guardando cultivo:", error);
      toast.error(
        (error as any)?.response?.data?.message ||
        "No se pudo crear el cultivo. Verifica que no exista uno activo en la misma ubicación."
      );
    }
  };

  const confirmUpdate = async () => {
    if (!cultivo) return;
    if (!motivoCambio.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: cultivo.id,
        dto: {
          ...(form as UpdateCultivoInput),
          nombre: form.nombre?.trim(),
          tipoCultivo: form.tipoCultivo,
          idSublote: form.idSublote ?? null,
          idLote: form.idSublote ? undefined : form.idLote ?? selectedLoteId,
          motivo: motivoCambio,
        },
      });
      setShowMotivo(false);
      setMotivoCambio("");
      onSuccess?.();
      if (redirectOnSuccess) navigate("/cultivos");
    } catch (error) {
      console.error("Error guardando cultivo:", error);
      toast.error(
        (error as any)?.response?.data?.message ||
        "No se pudo guardar el cultivo. Revisa validaciones (motivo obligatorio, ubicación, estado activo único)."
      );
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto rounded-2xl bg-white p-4 md:p-6 shadow-lg space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sprout className="w-7 h-7 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">{isEdit ? "Actualiza la información del cultivo" : "Completa los datos para registrar un cultivo"}</p>
            <h2 className="text-2xl font-semibold text-gray-800">{isEdit ? "Editar cultivo" : "Registrar cultivo"}</h2>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-gray-50 to-white shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 text-gray-800">
            <Sprout className="w-4 h-4 text-green-600" />
            <h3 className="text-base font-semibold">Información básica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              size="sm"
              label="Nombre"
              startContent={<Sprout className="w-4 h-4 text-gray-500" />}
              value={form.nombre || ""}
              onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
              placeholder="Ej. Tomate cherry"
              isRequired
              isReadOnly={readOnly}
            />

            <div className="flex gap-2 items-end">
              <Select
                size="sm"
                startContent={<Settings className="w-4 h-4 text-gray-500" />}
                label="Tipo de cultivo"
                selectedKeys={new Set(form.idTipoCultivo ? [String(form.idTipoCultivo)] : [])}
                onSelectionChange={(keys) => {
                  const k = Array.from(keys as Set<string>)[0];
                  const selected = tipoCultivoOptions.find((opt) => opt.key === k);
                  setForm((s) => ({ ...s, idTipoCultivo: k ? Number(k) : undefined, tipoCultivo: selected?.label }));
                }}
                placeholder="Seleccionar"
                className="flex-1"
                isRequired
                isDisabled={readOnly}
              >
                {tipoCultivoOptions.map((opt) => (
                  <SelectItem key={opt.key} textValue={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
              <Button size="sm" variant="flat" startContent={<Plus className="w-4 h-4" />} onPress={() => setIsModalOpen(true)} isDisabled={readOnly}>
                Nuevo
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-gray-50 to-white shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 text-gray-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-semibold">Ubicación</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              size="sm"
              startContent={<MapPin className="w-4 h-4 text-gray-500" />}
              label="Lote"
              selectedKeys={new Set(selectedLoteId ? [selectedLoteId.toString()] : [])}
              onSelectionChange={(keys) => {
                const k = Array.from(keys as Set<string>)[0];
                const newLoteId = k ? Number(k) : undefined;
                setSelectedLoteId(newLoteId);
                // Al cambiar de lote limpiamos sublote explícitamente para evitar que quede uno previo
                setForm((s) => ({ ...s, idLote: newLoteId, idSublote: null }));
              }}
              placeholder="Seleccionar lote"
              isDisabled={readOnly}
            >
              {loteOptions.map((opt) => (
                <SelectItem key={opt.key} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              size="sm"
              startContent={<MapPin className="w-4 h-4 text-gray-500" />}
              label="Sublote"
              selectedKeys={
                form.idSublote && sublotes.some((s: any) => s.id === form.idSublote)
                  ? new Set([String(form.idSublote)])
                  : new Set()
              }
              onSelectionChange={(keys) => {
                const k = Array.from(keys as Set<string>)[0];
                const subId = k ? Number(k) : undefined;
                const selected = sublotes.find((s: any) => s.id === subId);
                setForm((s) => ({
                  ...s,
                  idSublote: subId,
                  idLote: selected?.idLote ?? s.idLote,
                }));
                if (selected?.idLote) {
                  setSelectedLoteId(selected.idLote);
                }
              }}
              placeholder="Seleccionar sublote"
              isDisabled={!selectedLoteId || readOnly}
            >
              {subloteOptions.map((opt) => (
                <SelectItem key={opt.key} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-gray-50 to-white shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 text-gray-800">
            <Image className="w-4 h-4 text-indigo-500" />
            <h3 className="text-base font-semibold">Imagen</h3>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">Imagen (opcional)</label>
            {!readOnly && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm((s) => ({ ...s, img: file }));
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            )}
            {imagePreview && <img src={imagePreview} alt="Vista previa" className="mt-2 h-32 w-full max-w-sm rounded-xl object-cover shadow-sm border border-gray-100" />}
          </div>
        </div>

        {isEdit && (
          <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-gray-50 to-white shadow-sm p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-2 text-gray-800">
              <Settings className="w-4 h-4 text-blue-500" />
              <h3 className="text-base font-semibold">Estado</h3>
            </div>
            <Select
              size="sm"
              startContent={<Settings className="w-4 h-4 text-gray-500" />}
              label="Estado"
              selectedKeys={new Set([form.estado || ""])}
              onSelectionChange={(keys) => {
                const k = Array.from(keys as Set<string>)[0];
                setForm((s) => ({ ...s, estado: k as "activo" | "inactivo" | "finalizado" }));
              }}
              placeholder="Seleccionar estado"
              isDisabled={readOnly}
            >
              {estadoOptions.map((opt) => (
                <SelectItem key={opt.key} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-gray-50 to-white shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 text-gray-800">
            <FileText className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-semibold">Descripción</h3>
          </div>
          <Textarea
            size="sm"
            label="Descripción (opcional)"
            value={form.descripcion || ""}
            onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
            placeholder="Detalles del cultivo"
            minRows={3}
            className="resize-none"
            isReadOnly={readOnly}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {readOnly ? (
          <>
            <Button variant="flat" onPress={handleCancel}>
              Cerrar
            </Button>
            {onToggleEdit && (
              <Button color="success" className="text-black font-semibold" onPress={onToggleEdit}>
                Editar
              </Button>
            )}
          </>
        ) : (
          <>
            <Button variant="flat" onPress={handleCancel}>
              Cancelar
            </Button>
            <Button
              color="success"
              className="text-black font-semibold"
              onPress={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending || createTipoMutation.isPending}
              isDisabled={!canSubmit}
            >
              {isEdit ? "Guardar cambios" : "Registrar"}
            </Button>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Crear nuevo tipo de cultivo</ModalHeader>
              <ModalBody>
                <Input
                  size="sm"
                  label="Nombre"
                  value={modalTipoName}
                  onChange={(e) => setModalTipoName(e.target.value)}
                  placeholder="Ej. Hortaliza"
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
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

      <Modal isOpen={showMotivo} onOpenChange={setShowMotivo}>
        <ModalContent>
          <ModalHeader>Confirma los cambios</ModalHeader>
          <ModalBody>
            <Textarea
              size="sm"
              label="Motivo del cambio"
              placeholder="Ingresa el motivo para modificar el cultivo"
              value={motivoCambio}
              onChange={(e) => setMotivoCambio(e.target.value)}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowMotivo(false)}>
              Cancelar
            </Button>
            <Button color="primary" onPress={confirmUpdate} isLoading={updateMutation.isPending} isDisabled={!motivoCambio.trim()}>
              Confirmar cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
