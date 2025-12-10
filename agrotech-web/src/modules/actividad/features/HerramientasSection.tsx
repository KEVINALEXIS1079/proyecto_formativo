import { useState, useEffect } from "react";
import type { Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Button, Input, Select, SelectItem, Card, CardBody } from "@heroui/react";
import { Plus, Trash2, Wrench } from "lucide-react";
import { api } from "@/shared/api/client";

interface HerramientasSectionProps {
    control: Control<any>;
}

export default function HerramientasSection({ control }: HerramientasSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "herramientas",
    });

    const [activosFijos, setActivosFijos] = useState<any[]>([]);

    useEffect(() => {
        // Fetch fixed assets
        api.get("/insumos/activos-fijos").then((res) => {
            setActivosFijos(res.data);
        }).catch(console.error);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Herramientas y Maquinaria
                </h3>
                <Button
                    size="sm"
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => append({ activoFijoId: "", horasUso: 1 })}
                >
                    Agregar Herramienta
                </Button>
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p>No se han asignado herramientas a esta actividad.</p>
                </div>
            )}

            <div className="grid gap-4">
                {fields.map((field, index) => (
                    <Card key={field.id}>
                        <CardBody>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Select
                                        label="Herramienta / Maquinaria"
                                        placeholder="Seleccione un activo"
                                        {...control.register(`herramientas.${index}.activoFijoId` as const, { required: true })}
                                    >
                                        {activosFijos.map((activo) => (
                                            <SelectItem key={activo.id} textValue={activo.nombre}>
                                                {activo.nombre} ({activo.codigo})
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="w-32">
                                    <Input
                                        type="number"
                                        label="Horas Uso"
                                        placeholder="0"
                                        min="0"
                                        {...control.register(`herramientas.${index}.horasUso` as const, { required: true, min: 0 })}
                                    />
                                </div>
                                <Button
                                    isIconOnly
                                    color="danger"
                                    variant="light"
                                    onPress={() => remove(index)}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
