import { useState, useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Tabs, Tab, Card, CardBody } from "@heroui/react";
import { Save } from "lucide-react";
import { actividadSchema, type ActividadFormData } from "../models/schemas";
import type { CreateActividadPayload } from "../models/types";
import GeneralSection from "../features/GeneralSection";
import ResponsablesSection from "../features/ResponsablesSection";
import InsumosSection from "../features/InsumosSection";
import ServiciosSection from "../features/ServiciosSection";
import EvidenciasSection from "../features/EvidenciasSection";
import HerramientasSection from "../features/HerramientasSection";
import {
  listCultivos,
  listLotes,
  listUsuarios,
  listInsumos,
  listSubLotes,
} from "../api";
import toast from "react-hot-toast";

interface ActividadFormProps {
  onSubmit: (data: CreateActividadPayload) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateActividadPayload>;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function ActividadForm({
  onSubmit,
  isLoading = false,
  initialData,
  submitLabel = "Guardar",
  onCancel,
}: ActividadFormProps) {
  const processedDefaultValues: Partial<ActividadFormData> = useMemo(() => {
    if (!initialData) {
      return {
        nombre: "",
        tipo: "",
        subtipo: "",
        fecha: new Date(),
        loteId: 0,
        subLoteId: undefined, // Explicit undefined
        cultivoId: 0,
        descripcion: "",
        responsables: [],
        insumos: [],
        servicios: [],
        evidencias: [],
        herramientas: [],
        horasActividad: 0,
        precioHoraActividad: 0,
        estado: "PENDIENTE", // Default to Planned
      };
    }

    const fechaDate = initialData.fecha ? new Date(initialData.fecha) : new Date();

    return {
      estado: (initialData.estado as "PENDIENTE" | "FINALIZADA") || "PENDIENTE",
      nombre: initialData.nombre || "",
      tipo: initialData.tipo || "",
      subtipo: initialData.subtipo || "",
      fecha: fechaDate,
      loteId: initialData.loteId ?? 0,
      subLoteId: initialData.subLoteId ?? undefined,
      cultivoId: initialData.cultivoId ?? 0,
      descripcion: initialData.descripcion || "",
      horasActividad: initialData.horasActividad ?? 0,
      precioHoraActividad: initialData.precioHoraActividad ?? 0,
      cantidadPlantas: initialData.cantidadPlantas ?? undefined,
      kgRecolectados: initialData.kgRecolectados ?? undefined,
      responsables: (initialData.responsables || []).map(r => ({
        usuarioId: r.usuarioId,
        horas: r.horas ?? 0,
        precioHora: r.precioHora ?? 0,
      })),
      insumos: (initialData.insumos || []).map(i => ({
        insumoId: i.insumoId,
        cantidadUso: i.cantidadUso,
        costoUnitarioUso: i.costoUnitarioUso,
        descripcion: i.descripcion,
      })),
      servicios: (initialData.servicios || []).map(s => ({
        nombreServicio: s.nombreServicio,
        horas: s.horas,
        precioHora: s.precioHora,
      })),
      evidencias: (initialData.evidencias || []).map(e => ({
        descripcion: e.descripcion,
        imagenes: e.imagenes,
      })),
      herramientas: (initialData.herramientas || []).map(h => ({
        activoFijoId: h.activoFijoId,
        horasUso: h.horasUso,
      })),
    }; // removed type assertion to let TS check compatibility
  }, [initialData]);

  const { control, handleSubmit, watch, setValue } =
    useForm<ActividadFormData>({
      resolver: zodResolver(actividadSchema) as any, // Cast to any to bypass inferred type mismatch
      defaultValues: processedDefaultValues,
    });

  const onError = (errors: any) => {
    console.log("Validation Errors:", errors);
    toast.error("Por favor corrija los errores en el formulario");
  }

  const handleFormSubmit: SubmitHandler<ActividadFormData> = (data) => {
    // Transform Form Data (Date) to Payload (String)
    const payload: CreateActividadPayload = {
      ...data,
      fecha: data.fecha.toISOString(),
      subLoteId: data.subLoteId, // Direct assignment now possible
      cantidadPlantas: data.cantidadPlantas,
      kgRecolectados: data.kgRecolectados,
    };
    return onSubmit(payload);
  };

  // ... inside component
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [insumos, setInsumos] = useState<any[]>([]);

  useEffect(() => {
    listCultivos().then(setCultivos).catch(console.error);
    listLotes().then(setLotes).catch(console.error);
    listSubLotes().then(setSubLotes).catch(console.error);
    listUsuarios().then(setUsuarios).catch(console.error);
    listInsumos({ tipoInsumo: "CONSUMIBLE" }).then(setInsumos).catch(console.error);
  }, []);

  // Auto-select Lote and SubLote based on Cultivo to ensure consistency
  const cultivoId = watch("cultivoId");
  useEffect(() => {
    if (cultivoId && cultivoId !== 0) {
      const cultivo = cultivos.find((c) => c.id === cultivoId);
      if (cultivo) {
        if (cultivo.loteId) setValue("loteId", cultivo.loteId);
        if (cultivo.subLoteId) setValue("subLoteId", cultivo.subLoteId);
      }
    }
  }, [cultivoId, cultivos, setValue]);

  const estado = watch("estado");

  const isFinalized = estado === "FINALIZADA" || initialData?.estado === "FINALIZADA"; // Trust form state first
  const isReservationMode = !isFinalized; // Simplified logic: If not finalized, it is planned/reserved

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, onError)} className="space-y-6">
      <Tabs
        aria-label="Opciones de actividad"
        color="success"
        variant="underlined"
        classNames={{
          tabList: "gap-6",
          cursor: "w-full bg-green-600",
          tab: "max-w-fit px-4 h-12",
        }}
      >
        <Tab key="general" title="General">
          <Card>
            <CardBody>
              {/* State Toggle Section */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Estado de la Actividad</h3>
                  <p className="text-sm text-gray-500">
                    {isReservationMode
                      ? "Planificando para el futuro. Los recursos se reservarán."
                      : "Registrando actividad ya completada. Los recursos se consumirán inmediatamente."}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-300">
                  <Button
                    size="sm"
                    color={isReservationMode ? "warning" : "default"}
                    variant={isReservationMode ? "solid" : "light"}
                    className={isReservationMode ? "text-white" : "text-gray-500"}
                    onPress={() => setValue("estado", "PENDIENTE")}
                  >
                    Planificada (Pendiente)
                  </Button>
                  <Button
                    size="sm"
                    color={!isReservationMode ? "success" : "default"}
                    variant={!isReservationMode ? "solid" : "light"}
                    className={!isReservationMode ? "text-white" : "text-gray-500"}
                    onPress={() => setValue("estado", "FINALIZADA")}
                  >
                    Realizada (Finalizada)
                  </Button>
                </div>
              </div>

              <GeneralSection
                control={control}
                watch={watch}
                setValue={setValue}
                cultivos={cultivos}
                lotes={lotes}
                subLotes={subLotes}
              />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="responsables" title="Responsables">
          <Card>
            <CardBody>
              <ResponsablesSection
                control={control}
                watch={watch}
                usuarios={usuarios}
              />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="insumos" title="Insumos">
          <Card>
            <CardBody>
              <InsumosSection
                control={control}
                insumos={insumos}
                isReservationMode={isReservationMode}
              />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="servicios" title="Servicios">
          <Card>
            <CardBody>
              <ServiciosSection control={control} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="evidencias" title="Evidencias">
          <Card>
            <CardBody>
              <EvidenciasSection control={control} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="herramientas" title="Herramientas">
          <Card>
            <CardBody>
              <HerramientasSection control={control} />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <div className="sticky bottom-0 z-20 bg-white border-t border-gray-200 p-4 flex justify-end gap-2 -mx-6 -mb-6 rounded-b-lg mt-6">
        {onCancel && (
          <Button
            color="danger"
            variant="light"
            className="text-black"
            onPress={onCancel}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          color="success"
          className="text-black font-medium"
          isLoading={isLoading}
          startContent={<Save className="w-4 h-4" />}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
