import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createActivoFijo } from "../api/insumos.service";
import { listCategoriasInsumo } from "../api/categorias-insumo.service";
import { listAlmacenes } from "../api/almacenes.service";
import { listProveedores } from "../api/proveedores.service";
import { useCreateCategoria } from "../hooks/useCreateCategoria";
import { useCreateProveedor } from "../hooks/useCreateProveedor";
import { useCreateAlmacen } from "../hooks/useCreateAlmacen";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import ImageUpload from "../widgets/ImageUpload";
import { Plus, Upload } from "lucide-react";

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

    const { data: categorias } = useQuery({
        queryKey: ['categorias-insumo', 'NO_CONSUMIBLE'],
        queryFn: () => listCategoriasInsumo({ tipoInsumo: 'NO_CONSUMIBLE' })
    });
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
            toast.error("Error al crear activo fijo. Verifique los datos o la conexión.");
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
                size="3xl"
                scrollBehavior="inside"
                placement="center"
                classNames={{
                    wrapper: "items-center justify-center overflow-hidden",
                    base: "max-h-[90vh] w-full max-w-4xl mx-4 my-auto",
                    body: "overflow-y-auto overflow-x-hidden max-h-[70vh] py-4",
                    backdrop: "bg-black/50",
                    header: "flex-shrink-0 border-b border-gray-200",
                    footer: "flex-shrink-0 border-t border-gray-200"
                }}
            >
                <ModalContent>
                    {(onCloseModal) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader className="px-6 py-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Crear Activo Fijo</h2>
                                    <p className="text-sm text-gray-500 font-normal mt-1">Registra herramientas, maquinaria y equipos</p>
                                </div>
                            </ModalHeader>
                            <ModalBody className="px-6">
                                {/* Image Upload Section */}
                                <div className="pb-4 mb-4 border-b border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Imagen del Activo
                                    </label>
                                    <ImageUpload
                                        onFileChange={setSelectedFile}
                                        label="Subir imagen del activo fijo"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Columna Izquierda: Información General */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-3">Información General</h3>
                                        <Controller
                                            name="nombre"
                                            control={control}
                                            rules={{ required: "Nombre es requerido" }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Nombre del Activo"
                                                    errorMessage={errors.nombre?.message as string}
                                                    isInvalid={!!errors.nombre}
                                                    size="sm"
                                                    classNames={{
                                                        label: "font-medium"
                                                    }}
                                                />
                                            )}
                                        />

                                        {/* Categoría con botón + */}
                                        <div className="flex gap-2">
                                            <Controller
                                                name="categoriaId"
                                                control={control}
                                                rules={{ required: "Categoría requerida" }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        label="Categoría"
                                                        errorMessage={errors.categoriaId?.message as string}
                                                        isInvalid={!!errors.categoriaId}
                                                        selectedKeys={field.value ? [String(field.value)] : []}
                                                        size="sm"
                                                        className="flex-1"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    >
                                                        {(categorias || []).map((cat) => (
                                                            <SelectItem key={cat.id} textValue={cat.nombre}>
                                                                {cat.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="flat"
                                                color="success"
                                                className="mt-6 text-black min-w-unit-10"
                                                onPress={() => setIsCreateCategoriaModalOpen(true)}
                                                isIconOnly
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Almacén con botón + */}
                                        <div className="flex gap-2">
                                            <Controller
                                                name="almacenId"
                                                control={control}
                                                rules={{ required: "Almacén requerido" }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        label="Almacén"
                                                        errorMessage={errors.almacenId?.message as string}
                                                        isInvalid={!!errors.almacenId}
                                                        selectedKeys={field.value ? [String(field.value)] : []}
                                                        size="sm"
                                                        className="flex-1"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    >
                                                        {(almacenes || []).map((alm: any) => (
                                                            <SelectItem key={alm.id} textValue={alm.nombre}>
                                                                {alm.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="flat"
                                                color="success"
                                                className="mt-6 text-black min-w-unit-10"
                                                onPress={() => setIsCreateAlmacenModalOpen(true)}
                                                isIconOnly
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Columna Derecha: Detalles Financieros */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-3">Detalles Financieros</h3>

                                        {/* Proveedor con botón + */}
                                        <div className="flex gap-2">
                                            <Controller
                                                name="proveedorId"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        label="Proveedor (Opcional)"
                                                        selectedKeys={field.value ? [String(field.value)] : []}
                                                        size="sm"
                                                        className="flex-1"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    >
                                                        {(proveedores || []).map((prov: any) => (
                                                            <SelectItem key={prov.id} textValue={prov.nombre}>
                                                                {prov.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="flat"
                                                color="success"
                                                className="mt-6 text-black min-w-unit-10"
                                                onPress={() => setIsCreateProveedorModalOpen(true)}
                                                isIconOnly
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Controller
                                                name="costoAdquisicion"
                                                control={control}
                                                rules={{ required: "Costo requerido", min: 0 }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        label="Costo Adquisición"
                                                        startContent="$"
                                                        errorMessage={errors.costoAdquisicion?.message as string}
                                                        isInvalid={!!errors.costoAdquisicion}
                                                        size="sm"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name="valorResidual"
                                                control={control}
                                                rules={{ required: "Valor residual requerido", min: 0 }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        label="Valor Residual"
                                                        startContent="$"
                                                        errorMessage={errors.valorResidual?.message as string}
                                                        isInvalid={!!errors.valorResidual}
                                                        size="sm"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Controller
                                                name="vidaUtilHoras"
                                                control={control}
                                                rules={{ required: "Vida útil requerida", min: 1 }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        label="Vida Útil (Horas)"
                                                        errorMessage={errors.vidaUtilHoras?.message as string}
                                                        isInvalid={!!errors.vidaUtilHoras}
                                                        size="sm"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name="cantidad"
                                                control={control}
                                                defaultValue={1}
                                                rules={{ required: "Cantidad requerida", min: 1 }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        label="Cantidad a Registrar"
                                                        min={1}
                                                        errorMessage={errors.cantidad?.message as string}
                                                        isInvalid={!!errors.cantidad}
                                                        size="sm"
                                                        classNames={{
                                                            label: "font-medium"
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <Controller
                                            name="fechaAdquisicion"
                                            control={control}
                                            rules={{ required: "Fecha requerida" }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    label="Fecha Adquisición"
                                                    errorMessage={errors.fechaAdquisicion?.message as string}
                                                    isInvalid={!!errors.fechaAdquisicion}
                                                    size="sm"
                                                    classNames={{
                                                        label: "font-medium"
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Controller
                                        name="descripcion"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label="Descripción"
                                                placeholder="Detalles adicionales del activo..."
                                                minRows={2}
                                                size="sm"
                                                classNames={{
                                                    label: "font-medium"
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter className="px-6 py-4">
                                <Button color="danger" variant="light" onPress={onCloseModal} size="sm">
                                    Cancelar
                                </Button>
                                <Button color="success" type="submit" isLoading={mutation.isPending} size="sm" className="text-black font-semibold">
                                    Guardar Activo
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal para crear categoría */}
            <Modal
                isOpen={isCreateCategoriaModalOpen}
                onOpenChange={setIsCreateCategoriaModalOpen}
                size="sm"
            >
                <ModalContent>
                    <ModalHeader>Crear Nueva Categoría</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Nombre de la categoría"
                            placeholder="Ingrese el nombre"
                            value={newCategoriaName}
                            onChange={(e) => setNewCategoriaName(e.target.value)}
                            required
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="flat"
                            onPress={() => {
                                setIsCreateCategoriaModalOpen(false);
                                setNewCategoriaName("");
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="success"
                            className="text-black font-medium"
                            onPress={handleCreateCategoria}
                            isLoading={createCategoriaMutation.isPending}
                            disabled={!newCategoriaName.trim()}
                        >
                            Crear
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal para crear proveedor */}
            <Modal
                isOpen={isCreateProveedorModalOpen}
                onOpenChange={setIsCreateProveedorModalOpen}
                size="sm"
            >
                <ModalContent>
                    <ModalHeader>Crear Nuevo Proveedor</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Nombre del proveedor"
                            placeholder="Ingrese el nombre"
                            value={newProveedorName}
                            onChange={(e) => setNewProveedorName(e.target.value)}
                            required
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="flat"
                            onPress={() => {
                                setIsCreateProveedorModalOpen(false);
                                setNewProveedorName("");
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="success"
                            className="text-black font-medium"
                            onPress={handleCreateProveedor}
                            isLoading={createProveedorMutation.isPending}
                            disabled={!newProveedorName.trim()}
                        >
                            Crear
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal para crear almacén */}
            <Modal
                isOpen={isCreateAlmacenModalOpen}
                onOpenChange={setIsCreateAlmacenModalOpen}
                size="sm"
            >
                <ModalContent>
                    <ModalHeader>Crear Nuevo Almacén</ModalHeader>
                    <ModalBody className="space-y-4">
                        <Input
                            label="Nombre del almacén"
                            placeholder="Ingrese el nombre"
                            value={newAlmacenName}
                            onChange={(e) => setNewAlmacenName(e.target.value)}
                            required
                        />
                        <Input
                            label="Ubicación (opcional)"
                            placeholder="Ingrese la ubicación física"
                            value={newAlmacenUbicacion}
                            onChange={(e) => setNewAlmacenUbicacion(e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="flat"
                            onPress={() => {
                                setIsCreateAlmacenModalOpen(false);
                                setNewAlmacenName("");
                                setNewAlmacenUbicacion("");
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="success"
                            className="text-black font-medium"
                            onPress={handleCreateAlmacen}
                            isLoading={createAlmacenMutation.isPending}
                            disabled={!newAlmacenName.trim()}
                        >
                            Crear
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
