import { useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
} from "@heroui/react";
import { useForm, useFieldArray } from "react-hook-form";
import { uploadFile } from "../api/upload";
import { CheckCircle, AlertTriangle, Upload, X } from "lucide-react";
import type { Actividad } from "../models/types";
import { useFinalizeActividad, useActividad } from "../hooks/useActividades";
import toast from "react-hot-toast";

interface iFinalizeForm {
    insumosReales: {
        insumoId: number;
        nombre: string; // for display
        cantidadReservada: number; // for reference
        cantidad: number; // real usage
        unidad: string;
    }[];
    evidencias: {
        descripcion: string;
        imagenes: string[];
    }[];
    fechaReal: string;
    produccion?: { // Optional
        cantidad: number;
        unidad: string;
    };
    herramientas: {
        activoFijoId: number;
        nombre: string;
        horas: number;
    }[];
}

interface FinalizeActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    actividad: Actividad | null;
}

export default function FinalizeActivityModal({
    isOpen,
    onClose,
    actividad,
}: FinalizeActivityModalProps) {
    const finalizeMutation = useFinalizeActividad();

    // Fetch full activity details to ensure we have insumosReserva
    const { data: fullActividad } = useActividad(actividad?.id || 0);

    const { control, register, handleSubmit, reset, setValue, watch } = useForm<iFinalizeForm>({
        defaultValues: {
            insumosReales: [],
            herramientas: [],
            evidencias: [],
            fechaReal: new Date().toISOString().split("T")[0],
        },
    });

    // ... (fields) ...
    const { fields: insumoFields } = useFieldArray({
        control,
        name: "insumosReales",
    });

    const { fields: evidenciaFields, append: appendEvidencia, remove: removeEvidencia } =
        useFieldArray({
            control,
            name: "evidencias",
        });

    const { fields: herramientaFields } = useFieldArray({
        control,
        name: "herramientas",
    });

    // ... (useEffect) ...
    // Load activity data when modal opens
    useEffect(() => {
        if (isOpen && fullActividad) {
            console.log("FinalizeModal: fullActividad loaded", fullActividad);
            console.log("FinalizeModal: insumosReserva", fullActividad.insumosReserva);

            // Populate insumos from reservations
            const mappedInsumos = (fullActividad.insumosReserva || []).map((r: any) => ({
                insumoId: r.insumoId,
                nombre: r.insumo?.nombre || `Insumo #${r.insumoId}`,
                cantidadReservada: r.cantidadReservada,
                cantidad: r.cantidadReservada, // Default to reserved amount
                unidad: r.insumo?.unidadUso || "unid",
            }));

            console.log("FinalizeModal: mappedInsumos", mappedInsumos);

            // Populate tools from plan
            const mappedHerramientas = (fullActividad.herramientas || []).map((h: any) => ({
                activoFijoId: h.activoFijoId,
                nombre: h.activoFijo?.nombre || "Herramienta",
                horas: h.horasEstimadas || 0,
            }));

            reset({
                fechaReal: new Date().toISOString().split("T")[0],
                evidencias: [],
                insumosReales: mappedInsumos,
                herramientas: mappedHerramientas,
                produccion: { cantidad: 0, unidad: 'Kg' } // Default
            });
        }
    }, [isOpen, fullActividad, reset]);

    const onSubmit = async (data: iFinalizeForm) => {
        if (!actividad) return;
        try {
            if (data.evidencias.length === 0) {
                toast.error("Debe adjuntar al menos una evidencia (foto/descripción)");
                return;
            }

            // Validate Cosecha
            if ((actividad.tipo === 'COSECHA' || actividad.subtipo === 'COSECHA') && (!data.produccion?.cantidad || data.produccion.cantidad <= 0)) {
                toast.error("Para finalizar una cosecha debe ingresar la cantidad producida mayor a 0.");
                return;
            }

            await finalizeMutation.mutateAsync({
                id: actividad.id,
                payload: {
                    fechaReal: new Date(data.fechaReal),
                    insumosReales: data.insumosReales.map(i => ({
                        insumoId: i.insumoId,
                        cantidad: Number(i.cantidad)
                    })),
                    evidencias: data.evidencias,
                    produccion: data.produccion ? {
                        cantidad: Number(data.produccion.cantidad),
                        unidad: data.produccion.unidad
                    } : undefined,
                    herramientas: data.herramientas.map(h => ({
                        activoFijoId: h.activoFijoId,
                        horasUso: Number(h.horas)
                    }))
                }
            });

            toast.success("Actividad finalizada correctamente");
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.message || "Error al finalizar actividad";
            toast.error(errorMessage);
        }
    };



    // Image Upload Handler
    const handleImageUpload = async (index: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const toastId = toast.loading("Subiendo imagen...");
            try {
                const url = await uploadFile(file);
                // Prepend localhost if relative (optional, depending on API return)
                const fullUrl = url.startsWith("http") ? url : `http://localhost:4000${url}`;

                const current = watch(`evidencias.${index}.imagenes`) || [];
                setValue(`evidencias.${index}.imagenes`, [...current, fullUrl]);
                toast.success("Imagen subida correctamente", { id: toastId });
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Error al subir imagen", { id: toastId });
            }
        };

        input.click();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                {() => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Finalizar Actividad</h2>
                            <p className="text-sm font-normal text-gray-500">{actividad?.nombre}</p>
                        </ModalHeader>
                        <ModalBody className="py-6 bg-gray-50/50">
                            <div className="space-y-6">

                                {/* Info */}
                                <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-blue-800 text-sm">Confirmación de Ejecución</p>
                                        <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                                            Verifique el consumo real de recursos y adjunte evidencias del trabajo realizado.
                                            Al finalizar, los recursos reservados se consumirán del inventario y se calcularán los costos finales.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column: Date, Production and Inputs */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Real de Ejecución</label>
                                            <Input
                                                type="date"
                                                variant="bordered"
                                                classNames={{ inputWrapper: "shadow-none border-gray-200" }}
                                                {...register("fechaReal", { required: true })}
                                            />
                                        </div>

                                        {/* PRODUCTION INPUT (Only for COSECHA) */}
                                        {(actividad?.tipo === 'COSECHA' || actividad?.subtipo === 'COSECHA') && (
                                            <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-sm font-bold text-green-800 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                                        Registro de Cosecha
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-green-700 mb-3">
                                                    Ingrese la cantidad total recolectada para generar el lote de producción.
                                                </p>
                                                <div className="flex gap-4">
                                                    <Input
                                                        type="number"
                                                        label="Cantidad Obtenida (Kg)"
                                                        placeholder="0.00"
                                                        labelPlacement="outside"
                                                        variant="bordered"
                                                        classNames={{ inputWrapper: "bg-white border-green-300" }}
                                                        {...register("produccion.cantidad", { valueAsNumber: true })}
                                                    />
                                                    <Input
                                                        type="text"
                                                        label="Unidad"
                                                        placeholder="Kg"
                                                        labelPlacement="outside"
                                                        variant="bordered"
                                                        defaultValue="Kg"
                                                        classNames={{ inputWrapper: "bg-white border-green-300" }}
                                                        {...register("produccion.unidad")}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                                    Consumo de Insumos
                                                </h3>
                                            </div>

                                            {insumoFields.length === 0 ? (
                                                <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                    <p className="text-gray-400 text-xs">No hay insumos reservados para esta actividad.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {insumoFields.map((field, index) => (
                                                        <div key={field.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="font-medium text-sm text-gray-700">{field.nombre}</p>
                                                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                                    {field.unidad}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-3 items-end">
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 mb-1">Reservado</p>
                                                                    <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                                                        {field.cantidadReservada}
                                                                    </div>
                                                                </div>
                                                                <div className="w-1/2">
                                                                    <Input
                                                                        type="number"
                                                                        label="Reales"
                                                                        labelPlacement="outside"
                                                                        placeholder="0"
                                                                        size="sm"
                                                                        variant="bordered"
                                                                        classNames={{ inputWrapper: "bg-white shadow-none" }}
                                                                        {...register(`insumosReales.${index}.cantidad`, { required: true, min: 0 })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* TOOLS USAGE SECTION */}
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                    Uso de Herramientas
                                                </h3>
                                            </div>

                                            {herramientaFields.length === 0 ? (
                                                <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                    <p className="text-gray-400 text-xs">No hay herramientas planificadas.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {herramientaFields.map((field, index) => (
                                                        <div key={field.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-medium text-sm text-gray-700 mb-1">{field.nombre}</p>
                                                                    <p className="text-xs text-gray-400">Horas Reales</p>
                                                                </div>
                                                                <div className="w-24">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        size="sm"
                                                                        variant="bordered"
                                                                        classNames={{ inputWrapper: "bg-white shadow-none" }}
                                                                        {...register(`herramientas.${index}.horas`, { required: true, min: 0 })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Evidence */}
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Evidencias (Obligatorio)
                                            </h3>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="success"
                                                className="font-medium"
                                                onPress={() => appendEvidencia({ descripcion: "", imagenes: [] })}
                                                startContent={<Upload className="w-4 h-4" />}
                                            >
                                                Agregar
                                            </Button>
                                        </div>

                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                            {evidenciaFields.map((field, index) => (
                                                <div key={field.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Evidencia #{index + 1}</span>
                                                        <Button isIconOnly size="sm" color="danger" variant="light" className="min-w-8 w-8 h-8" onPress={() => removeEvidencia(index)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <Textarea
                                                        placeholder="Describa el trabajo realizado..."
                                                        minRows={2}
                                                        variant="faded"
                                                        className="mb-3"
                                                        classNames={{ inputWrapper: "bg-gray-50 focus:bg-white" }}
                                                        {...register(`evidencias.${index}.descripcion`, { required: true })}
                                                    />

                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <div className="flex gap-2 flex-wrap items-center">
                                                            {(watch(`evidencias.${index}.imagenes`) || []).map((img, i) => (
                                                                <div key={i} className="relative group">
                                                                    <img src={img} alt="Evidencia" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                                                </div>
                                                            ))}
                                                            <Button size="sm" variant="bordered" className="h-16 w-16 border-2 border-gray-300 text-gray-400" onPress={() => handleImageUpload(index)}>
                                                                <Upload className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {evidenciaFields.length === 0 && (
                                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                                                    </div>
                                                    <p className="text-xs font-medium">Se requiere al menos una evidencia.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-100 py-4 px-6">
                            <Button color="danger" variant="light" onPress={onClose} className="font-medium">
                                Cancelar
                            </Button>
                            <Button color="success" className="text-white font-semibold shadow-lg shadow-green-200" type="submit" isLoading={finalizeMutation.isPending}>
                                Finalizar Actividad
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal >
    );
}
