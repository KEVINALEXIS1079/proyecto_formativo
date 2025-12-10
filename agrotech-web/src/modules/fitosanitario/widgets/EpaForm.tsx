import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, Tooltip } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Plus, X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import type { Epa, TipoEpaLite, TipoCultivoEpaLite, CreateEpaInput, TipoEpaEnum } from "../models/types";
import { useTipoEpaList, useCreateTipoEpa } from "../hooks/useFitosanitario";
import { useTipoCultivoEpaList, useCreateTipoCultivoEpa } from "../hooks/useFitosanitario";

type ValidationErrors = {
  nombre?: string;
  descripcion?: string;
  tipoEpa?: string;
  tipoCultivoEpaId?: string;
  sintomas?: string;
  manejoYControl?: string;
  mesesRiesgo?: string;
  temporadaText?: string;
  fotosSintomas?: string;
  fotosGenerales?: string;
  imagenes?: string;
};


function validateEpaForm(form: Partial<CreateEpaInput>): ValidationErrors {
  const errors: ValidationErrors = {};


  if (!form.nombre?.trim()) {
    errors.nombre = "El nombre es obligatorio";
  } else if (form.nombre.trim().length < 3) {
    errors.nombre = "El nombre debe tener al menos 3 caracteres";
  } else if (form.nombre.trim().length > 100) {
    errors.nombre = "El nombre no puede exceder 100 caracteres";
  }

  if (!form.descripcion?.trim()) {
    errors.descripcion = "La descripción es obligatoria";
  } else if (form.descripcion.trim().length < 10) {
    errors.descripcion = "La descripción debe tener al menos 10 caracteres";
  } else if (form.descripcion.trim().length > 1000) {
    errors.descripcion = "La descripción no puede exceder 1000 caracteres";
  }

  // Validación del tipo EPA
  if (!form.tipoEpa) {
    errors.tipoEpa = "Debe seleccionar un tipo de EPA";
  }

  // Validación del cultivo afectado
  if (!form.tipoCultivoEpaId) {
    errors.tipoCultivoEpaId = "Debe seleccionar un cultivo afectado";
  }

  // Validación de síntomas (opcional pero con límites si se proporciona)
  if (form.sintomas && form.sintomas.length > 2000) {
    errors.sintomas = "Los síntomas no pueden exceder 2000 caracteres";
  }

  // Validación de manejo y control (opcional pero con límites si se proporciona)
  if (form.manejoYControl && form.manejoYControl.length > 2000) {
    errors.manejoYControl = "El manejo y control no pueden exceder 2000 caracteres";
  }

  // Validación de temporadas (opcional pero con límites si se proporciona)
  if (form.temporadas && form.temporadas.length > 0) {
    const temporadaText = form.temporadas.join(', ');
    if (temporadaText.length > 200) {
      errors.temporadaText = "Las temporadas no pueden exceder 200 caracteres";
    }
  }

  // Validación de meses probables
  if (form.mesesProbables && form.mesesProbables.length > 12) {
    errors.mesesRiesgo = "No se pueden seleccionar más de 12 meses";
  }

  // Validación de imágenes
  if (form.imagenes && form.imagenes.length > 10) {
    errors.imagenes = "No se pueden subir más de 10 imágenes";
  }

  // Validación del tamaño y tipo de imágenes
  if (form.imagenes) {
    for (const file of form.imagenes) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        errors.imagenes = "Cada imagen no puede exceder 5MB";
        break;
      }
      if (!file.type.startsWith('image/')) {
        errors.imagenes = "Solo se permiten archivos de imagen";
        break;
      }
    }
  }

  return errors;
}


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
            color="success"
            className="text-black font-medium"
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
            color="success"
            className="text-black font-medium"
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
    tipoEpa: undefined,
    tipoCultivoEpaId: undefined,
    sintomas: "",
    manejoYControl: "",
    mesesProbables: [],
    temporadas: [],
    imagenes: [],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
        tipoEpa: epa.tipoEpa.tipoEpaEnum,
        tipoCultivoEpaId: epa.tipoCultivoEpa.id,
        sintomas: epa.sintomas || "",
        manejoYControl: epa.manejoYControl || "",
        mesesProbables: epa.mesesProbables || [],
        temporadas: epa.temporadas || [],
        imagenes: [], // No hay archivos al editar
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        estado: "presente",
        tipoEpa: "enfermedad", // Default selection to match edit mode behavior
        tipoCultivoEpaId: undefined,
        sintomas: "",
        manejoYControl: "",
        mesesProbables: [],
        temporadas: [],
        imagenes: [],
      });
    }
  }, [epa]);

  // Validar formulario en cada cambio
  useEffect(() => {
    const validationErrors = validateEpaForm(form);
    setErrors(validationErrors);
  }, [form]);

  const canSubmit = useMemo(() => {
    const validationErrors = validateEpaForm(form);
    return Object.keys(validationErrors).length === 0;
  }, [form]);

  // Función para marcar campos como tocados
  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Función para actualizar formulario con validación
  const updateForm = (updates: Partial<CreateEpaInput>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const selectedTipoEpaKey = form.tipoEpa || "";
  const selectedTipoCultivoEpaKey = String(form.tipoCultivoEpaId || "");

  const mesesOptions = Array.from({ length: 12 }, (_, i) => ({
    key: String(i + 1),
    label: new Date(0, i).toLocaleString('es', { month: 'long' }),
  }));

  const selectedMesesKeys = new Set(
    form.mesesProbables?.map(m => String(m)) || []
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
          <ModalBody className="space-y-8">
            {/* Sección 1: Información Básica */}
            <div className="space-y-6">
              <div className="border-b border-default-200 pb-2">
                <h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-success-500 rounded-full"></div>
                  Información Básica
                </h3>
                <p className="text-sm text-default-600 mt-1">Datos principales del registro fitosanitario</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre"
                  value={form.nombre || ""}
                  onChange={(e) => updateForm({ nombre: e.target.value })}
                  onBlur={() => handleFieldBlur('nombre')}
                  placeholder="Nombre común del problema"
                  variant="bordered"
                  isRequired
                  isInvalid={touched.nombre && !!errors.nombre}
                  errorMessage={touched.nombre ? errors.nombre : undefined}
                  description="Mínimo 3 caracteres, máximo 100"
                  className="md:col-span-2"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-default-700">Tipo de EPA</label>
                  <div className="flex gap-3 items-end">
                    <Select
                      selectedKeys={new Set([selectedTipoEpaKey])}
                      onSelectionChange={(keys) => {
                        const k = Array.from(keys as Set<string>)[0];
                        updateForm({ tipoEpa: k as TipoEpaEnum });
                      }}
                      onBlur={() => handleFieldBlur('tipoEpa')}
                      placeholder="Seleccionar tipo"
                      variant="bordered"
                      isRequired
                      isInvalid={touched.tipoEpa && !!errors.tipoEpa}
                      errorMessage={touched.tipoEpa ? errors.tipoEpa : undefined}
                      className="flex-1"
                    >
                      {tiposEpa.map((tipo) => (
                        <SelectItem key={tipo.tipoEpaEnum} textValue={tipo.nombre}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </Select>
                    <Tooltip content="Crear nuevo tipo EPA">
                      <Button
                        isIconOnly
                        variant="flat"
                        color="success"
                        className="h-12 w-12 min-w-12"
                        onPress={() => setCreateTipoEpaOpen(true)}
                      >
                        <Plus size={18} />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-default-700">Cultivo Afectado</label>
                  <div className="flex gap-3 items-end">
                    <Select
                      selectedKeys={new Set([selectedTipoCultivoEpaKey])}
                      onSelectionChange={(keys) => {
                        const k = Array.from(keys as Set<string>)[0];
                        updateForm({ tipoCultivoEpaId: k ? Number(k) : undefined });
                      }}
                      onBlur={() => handleFieldBlur('tipoCultivoEpaId')}
                      placeholder="Seleccionar cultivo"
                      variant="bordered"
                      isRequired
                      isInvalid={touched.tipoCultivoEpaId && !!errors.tipoCultivoEpaId}
                      errorMessage={touched.tipoCultivoEpaId ? errors.tipoCultivoEpaId : undefined}
                      className="flex-1"
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
                        color="success"
                        className="h-12 w-12 min-w-12"
                        onPress={() => setCreateTipoCultivoEpaOpen(true)}
                      >
                        <Plus size={18} />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <Textarea
                  label="Descripción"
                  value={form.descripcion || ""}
                  onChange={(e) => updateForm({ descripcion: e.target.value })}
                  onBlur={() => handleFieldBlur('descripcion')}
                  placeholder="Descripción detallada del problema fitosanitario"
                  minRows={3}
                  variant="bordered"
                  isRequired
                  isInvalid={touched.descripcion && !!errors.descripcion}
                  errorMessage={touched.descripcion ? errors.descripcion : undefined}
                  description="Mínimo 10 caracteres, máximo 1000"
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* Sección 2: Síntomas y Manejo */}
            <div className="space-y-6">
              <div className="border-b border-default-200 pb-2">
                <h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Síntomas y Manejo
                </h3>
                <p className="text-sm text-default-600 mt-1">Características visibles y métodos de control</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textarea
                  label="Síntomas"
                  value={form.sintomas || ""}
                  onChange={(e) => updateForm({ sintomas: e.target.value })}
                  onBlur={() => handleFieldBlur('sintomas')}
                  placeholder="Describe los signos visibles en la planta"
                  minRows={4}
                  variant="bordered"
                  isInvalid={touched.sintomas && !!errors.sintomas}
                  errorMessage={touched.sintomas ? errors.sintomas : undefined}
                  description="Máximo 2000 caracteres"
                />

                <Textarea
                  label="Manejo y Control"
                  value={form.manejoYControl || ""}
                  onChange={(e) => updateForm({ manejoYControl: e.target.value })}
                  onBlur={() => handleFieldBlur('manejoYControl')}
                  placeholder="Métodos preventivos y tratamientos recomendados"
                  minRows={4}
                  variant="bordered"
                  isInvalid={touched.manejoYControl && !!errors.manejoYControl}
                  errorMessage={touched.manejoYControl ? errors.manejoYControl : undefined}
                  description="Máximo 2000 caracteres"
                />
              </div>
            </div>

            {/* Sección 3: Temporada y Multimedia */}
            <div className="space-y-6">
              <div className="border-b border-default-200 pb-2">
                <h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                  Temporada y Multimedia
                </h3>
                <p className="text-sm text-default-600 mt-1">Información temporal y material visual de referencia</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Select
                    label="Meses de Mayor Riesgo"
                    selectionMode="multiple"
                    selectedKeys={selectedMesesKeys}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys as Set<string>).map(k => parseInt(k));
                      updateForm({ mesesProbables: selected });
                    }}
                    onBlur={() => handleFieldBlur('mesesRiesgo')}
                    placeholder="Seleccionar meses"
                    variant="bordered"
                    isInvalid={touched.mesesRiesgo && !!errors.mesesRiesgo}
                    errorMessage={touched.mesesRiesgo ? errors.mesesRiesgo : undefined}
                    description="Meses donde es más probable la aparición"
                  >
                    {mesesOptions.map((mes) => (
                      <SelectItem key={mes.key} textValue={mes.label}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Temporadas Afectadas"
                    value={form.temporadas?.join(', ') || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const temporadas = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
                      updateForm({ temporadas });
                    }}
                    onBlur={() => handleFieldBlur('temporadaText')}
                    placeholder="Ej: Época de lluvias, Verano, Invierno"
                    variant="bordered"
                    isInvalid={touched.temporadaText && !!errors.temporadaText}
                    errorMessage={touched.temporadaText ? errors.temporadaText : undefined}
                    description="Separar con comas"
                  />
                </div>

                {/* Zona de carga de imágenes mejorada */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700 flex items-center gap-2">
                      <ImageIcon size={16} />
                      Imágenes de Referencia
                    </label>
                    <div className={`border-2 border-dashed rounded-xl p-6 hover:bg-default-50 transition-all duration-200 text-center cursor-pointer relative ${touched.imagenes && errors.imagenes ? 'border-danger-400 bg-danger-50' : 'border-default-300 hover:border-success-400'
                      }`}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          updateForm({ imagenes: [...(form.imagenes || []), ...files] });
                        }}
                        onBlur={() => handleFieldBlur('imagenes')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-3 text-default-500">
                        <div className="w-12 h-12 bg-default-100 rounded-full flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Arrastra imágenes aquí</p>
                          <p className="text-xs text-default-400 mt-1">o haz clic para seleccionar archivos</p>
                          <p className="text-xs text-default-400 mt-2">Máximo 10 imágenes • 5MB cada una</p>
                        </div>
                      </div>
                    </div>
                    {touched.imagenes && errors.imagenes && (
                      <div className="flex items-center gap-2 text-danger text-sm bg-danger-50 p-2 rounded-lg">
                        <AlertCircle size={14} />
                        <span>{errors.imagenes}</span>
                      </div>
                    )}
                  </div>

                  {/* Previsualización de imágenes */}
                  {form.imagenes && form.imagenes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-default-700">Imágenes seleccionadas</label>
                      <div className="flex gap-3 overflow-x-auto py-2 pb-1 px-1">
                        {form.imagenes.map((file, index) => (
                          <div key={`file-${index}`} className="relative shrink-0 w-20 h-20 group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Nueva imagen ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-default-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateForm({
                                  imagenes: form.imagenes?.filter((_, i) => i !== index) || []
                                });
                              }}
                              className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 shadow-lg hover:bg-danger-600 transition-all duration-200 hover:scale-110 z-20"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancelar</Button>
            <Button
              color="success"
              className="text-black font-medium"
              isDisabled={!canSubmit}
              isLoading={false} // Se podría pasar prop isLoading si se desea
              onPress={() => {
                if (!canSubmit) return;

                // Validación final antes de enviar
                if (!form.nombre?.trim() || !form.descripcion?.trim() || !form.tipoEpa || !form.tipoCultivoEpaId) {
                  console.error("ERROR: Campos requeridos faltantes");
                  return;
                }

                const finalForm: CreateEpaInput = {
                  nombre: form.nombre.trim(),
                  descripcion: form.descripcion.trim(),
                  estado: form.estado || "presente",
                  tipoEpa: form.tipoEpa,
                  tipoCultivoEpaId: form.tipoCultivoEpaId,
                  cultivoId: form.cultivoId,
                  sintomas: form.sintomas?.trim(),
                  manejoYControl: form.manejoYControl?.trim(),
                  mesesProbables: form.mesesProbables || [],
                  temporadas: form.temporadas || [],
                  tags: form.tags,
                  imagenes: form.imagenes,
                };

                console.log("Enviando formulario final:", JSON.stringify(finalForm, null, 2));
                console.log("Campos requeridos:", {
                  nombre: !!finalForm.nombre,
                  descripcion: !!finalForm.descripcion,
                  tipoEpa: !!finalForm.tipoEpa,
                  tipoCultivoEpaId: !!finalForm.tipoCultivoEpaId,
                });

                onSubmit(finalForm);
              }}
            >
              {epa ? "Guardar Cambios" : "Crear Registro"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CreateTipoEpaModal
        isOpen={createTipoEpaOpen}
        onClose={() => setCreateTipoEpaOpen(false)}
        onSuccess={() => {
          // TipoEpaLite doesn't have tipoEpaEnum, we need to handle this differently
          // For now, we'll just close the modal and let the user select from the refreshed list
          setCreateTipoEpaOpen(false);
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