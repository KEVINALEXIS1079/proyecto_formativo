import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea, Card, CardBody } from "@heroui/react";
import { MapPin, Calendar, Sprout, FileText, Plus } from "lucide-react";
import { useLotesList, useSublotesList } from "../hooks/useLotes";
import { useTiposCultivoList, useTipoCultivoCreate } from "../hooks/useTiposCultivo";
import ImageUpload from "@/modules/inventario/widgets/ImageUpload";

interface CultivoFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
  onToggleEdit?: () => void;
  hideFooter?: boolean;
}

export default function CultivoForm({ initialData, onSubmit, onCancel, isLoading, readOnly = false, onToggleEdit, hideFooter = false }: CultivoFormProps) {
  const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      estado: "activo",
      fechaInicio: new Date().toISOString().split('T')[0]
    }
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.imagen) setPreviewUrl(initialData.imagen);
    }
  }, [initialData, reset]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imagen || null);

  // Quick create Tipo Cultivo
  const [isCreateTipoModalOpen, setIsCreateTipoModalOpen] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");

  const { data: lotes = [] } = useLotesList();
  const loteId = watch("loteId");

  // Sublotes depend on selected lote
  const { data: sublotes = [] } = useSublotesList(loteId ? Number(loteId) : 0);

  const { data: tipos = [] } = useTiposCultivoList();
  const createTipoMutation = useTipoCultivoCreate();

  // Confirm modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const handleFormSubmit = (data: any) => {
    if (readOnly) return;
    setPendingData(data);
    setIsConfirmModalOpen(true);
  };

  const confirmSubmit = () => {
    if (pendingData) {
      onSubmit({ ...pendingData, imagenFile: selectedFile });
    }
    setIsConfirmModalOpen(false);
  };

  const handleCreateTipo = () => {
    if (newTipoName.trim()) {
      createTipoMutation.mutate({ nombre: newTipoName, descripcion: "Creado desde formulario" }, {
        onSuccess: (newTipo) => {
          setIsCreateTipoModalOpen(false);
          setNewTipoName("");
          setValue("tipoCultivoId", newTipo.id);
        }
      });
    }
  };

  return (
    <>
      <form id="cultivo-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full gap-4">
        {/* Header para modo lectura/edición */}
        {(readOnly || onToggleEdit) && (
          <div className="flex justify-end">
            {readOnly && onToggleEdit && (
              <Button
                color="primary"
                variant="flat"
                onPress={onToggleEdit}
                size="sm"
                startContent={<FileText className="h-4 w-4" />}
              >
                Editar Información
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Imagen y Estado */}
          <div className="lg:col-span-4 space-y-4">
            <Card shadow="none" className="border border-gray-200 bg-white">
              <CardBody className="p-4">
                <ImageUpload
                  label="Imagen del Cultivo"
                  currentImageUrl={previewUrl || undefined}
                  onFileChange={(file) => {
                    setSelectedFile(file);
                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                />
              </CardBody>
            </Card>

            <Card shadow="none" className="border border-gray-200 bg-white">
              <CardBody className="p-4 space-y-4">
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Estado del Cultivo"
                      {...field}
                      selectedKeys={field.value ? [field.value] : []}
                      isDisabled={readOnly}
                      variant="bordered"
                    >
                      <SelectItem key="activo" startContent={<div className="w-2 h-2 rounded-full bg-green-500" />}>Activo</SelectItem>
                      <SelectItem key="inactivo" startContent={<div className="w-2 h-2 rounded-full bg-gray-400" />}>Inactivo</SelectItem>
                      <SelectItem key="finalizado" startContent={<div className="w-2 h-2 rounded-full bg-blue-500" />}>Finalizado</SelectItem>
                    </Select>
                  )}
                />
              </CardBody>
            </Card>
          </div>

          {/* Columna Derecha: Formulario Detallado */}
          <div className="lg:col-span-8 space-y-6">
            {/* Información Básica */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <Sprout className="h-4 w-4 text-green-600" /> Información Principal
              </h3>
              <div className="space-y-4">
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ required: "Nombre requerido" }}
                  render={({ field }) => (
                    <Input
                      label="Nombre del Cultivo"
                      placeholder="Ej: Tomates Lote A"
                      {...field}
                      errorMessage={errors.nombre?.message as string}
                      isInvalid={!!errors.nombre}
                      isDisabled={readOnly}
                      variant="bordered"
                    />
                  )}
                />

                <div className="flex gap-2 items-start">
                  <Controller
                    name="tipoCultivoId"
                    control={control}
                    rules={{ required: "Tipo requerido" }}
                    render={({ field }) => (
                      <Select
                        label="Tipo de Cultivo"
                        placeholder="Selecciona el tipo"
                        {...field}
                        selectedKeys={field.value ? [String(field.value)] : []}
                        errorMessage={errors.tipoCultivoId?.message as string}
                        isInvalid={!!errors.tipoCultivoId}
                        isDisabled={readOnly}
                        className="flex-1"
                        variant="bordered"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {tipos.map((t) => (
                          <SelectItem key={String(t.id)} textValue={t.nombre}>{t.nombre}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  {!readOnly && (
                    <Button isIconOnly color="success" className="mt-1 text-black font-bold" variant="solid" onPress={() => setIsCreateTipoModalOpen(true)}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                <Controller
                  name="descripcion"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="Descripción"
                      placeholder="Detalles adicionales sobre la siembra..."
                      {...field}
                      isDisabled={readOnly}
                      minRows={2}
                      variant="bordered"
                    />
                  )}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> Ubicación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="loteId"
                  control={control}
                  rules={{ required: "Lote requerido" }}
                  render={({ field }) => (
                    <Select
                      label="Lote"
                      placeholder="Seleccionar Lote"
                      {...field}
                      selectedKeys={field.value ? [String(field.value)] : []}
                      errorMessage={errors.loteId?.message as string}
                      isInvalid={!!errors.loteId}
                      isDisabled={readOnly}
                      variant="bordered"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        setValue("subloteId", null);
                      }}
                    >
                      {lotes.map((l) => (
                        <SelectItem key={String(l.id)} textValue={l.nombre}>{l.nombre}</SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="subloteId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Sublote"
                      placeholder="Seleccionar Sublote"
                      {...field}
                      selectedKeys={field.value ? [String(field.value)] : []}
                      isDisabled={readOnly || !loteId || sublotes.length === 0}
                      errorMessage={errors.subloteId?.message as string}
                      isInvalid={!!errors.subloteId}
                      variant="bordered"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {sublotes.map((sl) => (
                        <SelectItem key={String(sl.id)} textValue={sl.nombre}>{sl.nombre}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" /> Cronograma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="fechaInicio"
                  control={control}
                  rules={{ required: "Requerido" }}
                  render={({ field }) => (
                    <Input type="date" label="Fecha Inicio" {...field} isDisabled={readOnly} variant="bordered" />
                  )}
                />
                <Controller
                  name="fechaSiembra"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" label="Fecha Siembra" {...field} isDisabled={readOnly} variant="bordered" />
                  )}
                />
                <Controller
                  name="fechaFin"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" label="Fecha Fin (Est.)" {...field} isDisabled={readOnly} variant="bordered" />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {!hideFooter && !readOnly && (
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
            <Button color="danger" variant="light" onPress={onCancel}>
              Cancelar
            </Button>
            <Button color="success" type="submit" isLoading={isLoading} className="text-black font-semibold shadow-md">
              Guardar Cultivo
            </Button>
          </div>
        )}
      </form>

      <Modal isOpen={isCreateTipoModalOpen} onOpenChange={setIsCreateTipoModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Crear Nuevo Tipo de Cultivo</ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  placeholder="Ej: Maíz Dulce"
                  value={newTipoName}
                  onChange={(e) => setNewTipoName(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="success" className="text-black font-semibold" onPress={handleCreateTipo} isLoading={createTipoMutation.isPending}>
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirmar Cambios</ModalHeader>
              <ModalBody>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                  Estás a punto de guardar cambios en un cultivo. Asegúrate de que la información sea correcta.
                </div>
                <p className="mt-2">¿Confirmar y guardar?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Revisar</Button>
                <Button color="success" className="text-black font-semibold" onPress={confirmSubmit}>Confirmar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
