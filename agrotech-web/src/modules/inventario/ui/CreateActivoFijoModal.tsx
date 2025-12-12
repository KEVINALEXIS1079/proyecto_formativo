import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea, Card, CardBody } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createActivoFijo } from "../api/insumos.service";
import { listCategoriasInsumo } from "../api/categorias-insumo.service";
import { listAlmacenes } from "../api/almacenes.service";
import { listProveedores } from "../api/proveedores.service";
import { useCreateCategoria } from "../hooks/useCreateCategoria";
import { useCreateProveedor } from "../hooks/useCreateProveedor";
import { useCreateAlmacen } from "../hooks/useCreateAlmacen";
import { useCategoriaInsumoList } from "../hooks/useCategoriaInsumoList";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import ImageUpload from "@/modules/inventario/widgets/ImageUpload";
import { Plus, Upload, Box, DollarSign, FileText } from "lucide-react";

interface CreateActivoFijoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateActivoFijoModal({ isOpen, onClose }: CreateActivoFijoModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { errors } } = useForm();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Quick create modals state
    const [isCreateCategoriaModalOpen, setIsCreateCategoriaModalOpen] = useState(false);
    const [isCreateProveedorModalOpen, setIsCreateProveedorModalOpen] = useState(false);
    const [isCreateAlmacenModalOpen, setIsCreateAlmacenModalOpen] = useState(false);
    const [newCategoriaName, setNewCategoriaName] = useState("");
    const [newProveedorName, setNewProveedorName] = useState("");
    const [newAlmacenName, setNewAlmacenName] = useState("");
    const [newAlmacenUbicacion, setNewAlmacenUbicacion] = useState("");

    const { data: categorias } = useCategoriaInsumoList({ tipoInsumo: 'NO_CONSUMIBLE' });
    const { data: almacenes } = useQuery({ queryKey: ['almacenes'], queryFn: () => listAlmacenes() });
    const { data: proveedores } = useQuery({ queryKey: ['proveedores'], queryFn: () => listProveedores() });

    // Quick create mutations
    const createCategoriaMutation = useCreateCategoria();
    const createProveedorMutation = useCreateProveedor();
    const createAlmacenMutation = useCreateAlmacen();

    const mutation = useMutation({
        mutationFn: ({ data, file }: { data: any; file?: File }) => createActivoFijo(data, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activos-fijos'] });
            toast.success("Activo fijo creado correctamente");
            reset();
            setSelectedFile(null);
            onClose();
        },
        onError: (error) => {
            console.error(error);
            toast.error("Error al crear activo fijo.");
        }
    });

    const onSubmit = (data: any) => {
        const payload = {
            ...data,
            categoriaId: Number(data.categoriaId),
            almacenId: Number(data.almacenId),
            proveedorId: data.proveedorId ? Number(data.proveedorId) : undefined,
            costoAdquisicion: Number(data.costoAdquisicion),
            valorResidual: Number(data.valorResidual),
            vidaUtilHoras: Number(data.vidaUtilHoras),
            cantidad: Number(data.cantidad || 1),
        };
        mutation.mutate({ data: payload, file: selectedFile || undefined });
    };

    // Quick create handlers
    const handleCreateCategoria = () => {
        if (newCategoriaName.trim()) {
            createCategoriaMutation.mutate(
                { nombre: newCategoriaName.trim(), tipoInsumo: 'NO_CONSUMIBLE' },
                {
                    onSuccess: () => {
                        setIsCreateCategoriaModalOpen(false);
                        setNewCategoriaName("");
                        toast.success("Categoría creada");
                    },
                }
            );
        }
    };

    const handleCreateProveedor = () => {
        if (newProveedorName.trim()) {
            createProveedorMutation.mutate(
                { nombre: newProveedorName.trim() },
                {
                    onSuccess: () => {
                        setIsCreateProveedorModalOpen(false);
                        setNewProveedorName("");
                        toast.success("Proveedor creado");
                    },
                }
            );
        }
    };

    const handleCreateAlmacen = () => {
        if (newAlmacenName.trim()) {
            createAlmacenMutation.mutate(
                {
                    nombre: newAlmacenName.trim(),
                    descripcion: newAlmacenUbicacion.trim() || undefined,
                },
                {
                    onSuccess: () => {
                        setIsCreateAlmacenModalOpen(false);
                        setNewAlmacenName("");
                        setNewAlmacenUbicacion("");
                        toast.success("Almacén creado");
                    },
                }
            );
        }
    };

    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedFile(null);
        }
    }, [isOpen, reset]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="5xl"
                scrollBehavior="inside"
                placement="center"
                backdrop="blur"
            >
                <ModalContent>
                    {(onCloseModal) => (
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[80vh] overflow-hidden">
                            <ModalHeader className="px-6 py-4 border-b border-gray-100">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Box className="w-5 h-5 text-green-600" /> Crear Activo Fijo
                                    </h2>
                                    <p className="text-sm text-gray-500 font-normal">Registra maquinaria, herramientas o equipos</p>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6 bg-gray-50/50 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                    <div className="lg:col-span-4 space-y-4">
                                        <Card shadow="none" className="border border-gray-200 bg-white">
                                            <CardBody className="p-4">
                                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Upload className="w-4 h-4 text-gray-500" /> Imagen del Activo
                                                </label>
                                                <ImageUpload
                                                    onFileChange={setSelectedFile}
                                                    label="Subir foto"
                                                />
                                            </CardBody>
                                        </Card>

                                        <Card shadow="none" className="border border-gray-200 bg-white">
                                            <CardBody className="p-4 space-y-4">
                                                <div className="text-xs text-gray-500">
                                                    <p className="font-semibold mb-1">Nota:</p>
                                                    <p>Asegúrate de registrar la vida útil correcta para el cálculo de depreciación.</p>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    <div className="lg:col-span-8 space-y-4">
                                        {/* General Info */}
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-green-600" /> Información General
                                            </h3>

                                            <Controller
                                                name="nombre"
                                                control={control}
                                                rules={{ required: "Nombre es requerido" }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Nombre del Activo"
                                                        placeholder="Ej. Tractor John Deere"
                                                        errorMessage={errors.nombre?.message as string}
                                                        isInvalid={!!errors.nombre}
                                                        variant="bordered"
                                                        classNames={{ label: "font-medium" }}
                                                    />
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex gap-2 items-end">
                                                    <Controller
                                                        name="categoriaId"
                                                        control={control}
                                                        rules={{ required: "Requerido" }}
                                                        render={({ field }) => (
                                                            <Select
                                                                label="Categoría"
                                                                variant="bordered"
                                                                errorMessage={errors.categoriaId?.message as string}
                                                                isInvalid={!!errors.categoriaId}
                                                                selectedKeys={field.value ? [String(field.value)] : []}
                                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                                className="flex-1"
                                                            >
                                                                {(categorias || []).map((cat) => (
                                                                    <SelectItem key={cat.id} textValue={cat.nombre}>{cat.nombre}</SelectItem>
                                                                ))}
                                                            </Select>
                                                        )}
                                                    />
                                                    <Button isIconOnly variant="flat" color="success" onPress={() => setIsCreateCategoriaModalOpen(true)} className="mb-px">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex gap-2 items-end">
                                                    <Controller
                                                        name="almacenId"
                                                        control={control}
                                                        rules={{ required: "Requerido" }}
                                                        render={({ field }) => (
                                                            <Select
                                                                label="Almacén"
                                                                variant="bordered"
                                                                errorMessage={errors.almacenId?.message as string}
                                                                isInvalid={!!errors.almacenId}
                                                                selectedKeys={field.value ? [String(field.value)] : []}
                                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                                className="flex-1"
                                                            >
                                                                {(almacenes || []).map((alm: any) => (
                                                                    <SelectItem key={alm.id} textValue={alm.nombre}>{alm.nombre}</SelectItem>
                                                                ))}
                                                            </Select>
                                                        )}
                                                    />
                                                    <Button isIconOnly variant="flat" color="success" onPress={() => setIsCreateAlmacenModalOpen(true)} className="mb-px">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <Controller
                                                name="descripcion"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        {...field}
                                                        label="Descripción"
                                                        placeholder="Detalles adicionales..."
                                                        minRows={2}
                                                        variant="bordered"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Financial Details */}
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-600" /> Detalles Financieros
                                            </h3>

                                            <div className="flex gap-2 items-end">
                                                <Controller
                                                    name="proveedorId"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            label="Proveedor (Opcional)"
                                                            variant="bordered"
                                                            selectedKeys={field.value ? [String(field.value)] : []}
                                                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                            className="flex-1"
                                                        >
                                                            {(proveedores || []).map((prov: any) => (
                                                                <SelectItem key={prov.id} textValue={prov.nombre}>{prov.nombre}</SelectItem>
                                                            ))}
                                                        </Select>
                                                    )}
                                                />
                                                <Button isIconOnly variant="flat" color="success" onPress={() => setIsCreateProveedorModalOpen(true)} className="mb-px">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="costoAdquisicion"
                                                    control={control}
                                                    rules={{ required: "Requerido", min: 0 }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            label="Costo Adquisición"
                                                            startContent={<span className="text-gray-400">$</span>}
                                                            variant="bordered"
                                                            errorMessage={errors.costoAdquisicion?.message as string}
                                                            isInvalid={!!errors.costoAdquisicion}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="valorResidual"
                                                    control={control}
                                                    rules={{ required: "Requerido", min: 0 }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            label="Valor Residual"
                                                            startContent={<span className="text-gray-400">$</span>}
                                                            variant="bordered"
                                                            errorMessage={errors.valorResidual?.message as string}
                                                            isInvalid={!!errors.valorResidual}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="vidaUtilHoras"
                                                    control={control}
                                                    rules={{ required: "Requerido", min: 1 }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            label="Vida Útil (Horas)"
                                                            variant="bordered"
                                                            errorMessage={errors.vidaUtilHoras?.message as string}
                                                            isInvalid={!!errors.vidaUtilHoras}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="fechaAdquisicion"
                                                    control={control}
                                                    rules={{ required: "Requerido" }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="date"
                                                            label="Fecha Adquisición"
                                                            variant="bordered"
                                                            errorMessage={errors.fechaAdquisicion?.message as string}
                                                            isInvalid={!!errors.fechaAdquisicion}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <Controller
                                                name="cantidad"
                                                control={control}
                                                defaultValue={1}
                                                rules={{ required: "Requerido", min: 1 }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        label="Cantidad"
                                                        variant="bordered"
                                                        errorMessage={errors.cantidad?.message as string}
                                                        isInvalid={!!errors.cantidad}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                                <Button color="danger" variant="light" onPress={onCloseModal}>
                                    Cancelar
                                </Button>
                                <Button color="success" type="submit" isLoading={mutation.isPending} className="text-black font-semibold shadow-md">
                                    Guardar Activo
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>

            {/* Helper Modals (kept simple) */}
            <Modal isOpen={isCreateCategoriaModalOpen} onOpenChange={setIsCreateCategoriaModalOpen} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Nueva Categoría</ModalHeader>
                            <ModalBody><Input label="Nombre" value={newCategoriaName} onChange={(e) => setNewCategoriaName(e.target.value)} /></ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="success" className="text-black" onPress={handleCreateCategoria} isLoading={createCategoriaMutation.isPending}>Crear</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isCreateProveedorModalOpen} onOpenChange={setIsCreateProveedorModalOpen} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Nuevo Proveedor</ModalHeader>
                            <ModalBody><Input label="Nombre" value={newProveedorName} onChange={(e) => setNewProveedorName(e.target.value)} /></ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="success" className="text-black" onPress={handleCreateProveedor} isLoading={createProveedorMutation.isPending}>Crear</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={isCreateAlmacenModalOpen} onOpenChange={setIsCreateAlmacenModalOpen} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Nuevo Almacén</ModalHeader>
                            <ModalBody className="space-y-3">
                                <Input label="Nombre" value={newAlmacenName} onChange={(e) => setNewAlmacenName(e.target.value)} />
                                <Input label="Ubicación" value={newAlmacenUbicacion} onChange={(e) => setNewAlmacenUbicacion(e.target.value)} />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="success" className="text-black" onPress={handleCreateAlmacen} isLoading={createAlmacenMutation.isPending}>Crear</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
