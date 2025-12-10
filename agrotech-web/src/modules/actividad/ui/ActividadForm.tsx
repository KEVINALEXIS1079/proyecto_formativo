import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Tabs, Tab, Card, CardBody } from "@heroui/react";
import { Save } from "lucide-react";
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
  // ... (useForm logic remains same, skipping lines 33-80 implicitly by targeting outer block or just replacing Button area)
  // Wait, I can't "skip" in replace_file_content.
  // I'll grab the props definition block (lines 20-32) and the footer block (lines 148-158).
  // But replace_file_content is single contiguous block.
  // I'll use `multi_replace_file_content`.

  // But first I need to check if multi_replace is available. It is.
  // Let's use multi_replace.
  // Chunk 1: Interface and Destructuring.
  // Chunk 2: Button Rendering.

  const { control, handleSubmit, watch, setValue } =
    useForm<CreateActividadPayload>({
      defaultValues: initialData || {
        nombre: "",
        tipo: "",
        subtipo: "",
        responsables: [],
        insumos: [],
        servicios: [],
        evidencias: [],
        herramientas: [],
      },
    });

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

  const evidencias = watch("evidencias");
  const isFinalized =
    initialData?.estado === "FINALIZADA" ||
    initialData?.estado === "Finalizada";
  const willFinalize = evidencias && evidencias.length > 0;
  const isReservationMode = !isFinalized && !willFinalize;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs
        aria-label="Opciones de actividad"
        color="success"
        variant="underlined"
      >
        <Tab key="general" title="General">
          <Card>
            <CardBody>
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
                setValue={setValue}
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

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button
            color="danger"
            variant="flat"
            onPress={onCancel}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          color="success"
          className="text-white shadow-lg shadow-green-100"
          isLoading={isLoading}
          startContent={<Save className="w-4 h-4" />}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
