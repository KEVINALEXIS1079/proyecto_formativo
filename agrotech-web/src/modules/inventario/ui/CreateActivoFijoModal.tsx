import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createActivoFijo } from "../api/insumos.service";
import { listCategoriasInsumo } from "../api/categorias-insumo.service";
import { listAlmacenes } from "../api/almacenes.service";
import { listProveedores } from "../api/proveedores.service";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import ImagePreview from "../widgets/ImagePreview";

interface CreateActivoFijoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateActivoFijoModal({ isOpen, onClose }: CreateActivoFijoModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { errors } } = useForm();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: categorias } = useQuery({ queryKey: ['categorias-insumo'], queryFn: () => listCategoriasInsumo() });
    const { data: almacenes } = useQuery({ queryKey: ['almacenes'], queryFn: () => listAlmacenes() });
    const { data: proveedores } = useQuery({ queryKey: ['proveedores'], queryFn: () => listProveedores() });

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
        // Asegurar que los datos numéricos sean realmente números
        const payload = {
            ...data,
            categoriaId: Number(data.categoriaId),
            almacenId: Number(data.almacenId),
            proveedorId: data.proveedorId ? Number(data.proveedorId) : undefined,
            costoAdquisicion: Number(data.costoAdquisicion),
            valorResidual: Number(data.valorResidual),
            vidaUtilHoras: Number(data.vidaUtilHoras),
        };
        mutation.mutate({ data: payload, file: selectedFile || undefined });
    };

    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedFile(null);
        }
    }, [isOpen, reset]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            placement="center"
            classNames={{
                wrapper: "items-center justify-center overflow-hidden",
                base: "max-h-[85vh] w-full max-w-2xl mx-4 my-auto",
                body: "overflow-y-auto overflow-x-hidden max-h-[55vh] py-4",
                backdrop: "bg-black/50",
                header: "flex-shrink-0",
                footer: "flex-shrink-0"
            }}
        >
            <ModalContent>
                {(onCloseModal) => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader className="flex flex-col gap-1 px-6">Crear Activo Fijo</ModalHeader>
                        <ModalBody className="px-6">
                            {/* Image Upload Section */}
                            <div className="pb-3 border-b">
                                <ImagePreview
                                    onFileChange={setSelectedFile}
                                    label="Imagen del Activo Fijo"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                                {/* Columna Izquierda: Información General */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-default-500 border-b pb-1">Información General</h3>
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
                                            />
                                        )}
                                    />

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
                                            >
                                                {(categorias || []).map((cat) => (
                                                    <SelectItem key={cat.id} textValue={cat.nombre}>
                                                        {cat.nombre}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />

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
                                            >
                                                {(almacenes || []).map((alm: any) => (
                                                    <SelectItem key={alm.id} textValue={alm.nombre}>
                                                        {alm.nombre}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />

                                </div>

                                {/* Columna Derecha: Detalles Financieros */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-default-500 border-b pb-1">Detalles Financieros</h3>
                                    <Controller
                                        name="proveedorId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Proveedor (Opcional)"
                                                selectedKeys={field.value ? [String(field.value)] : []}
                                                size="sm"
                                            >
                                                {(proveedores || []).map((prov: any) => (
                                                    <SelectItem key={prov.id} textValue={prov.nombre}>
                                                        {prov.nombre}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
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
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
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
                                                />
                                            )}
                                        />
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
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 lg:col-span-2 mt-2">
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
                                        />
                                    )}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter className="px-6">
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
    );
}
