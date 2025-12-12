import { Input, Select, SelectItem, Textarea, Card, CardBody, Button } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ActividadFormData } from "../models/schemas";
import { AlertCircle, Leaf, Sprout, CheckCircle2, Plus } from "lucide-react";
import LeafletMap from "../../../components/LeafletMap";
import CreateProductModal from "../widgets/CreateProductModal";

function LoteMapPreview({ loteId, lotes }: { loteId: number; lotes: any[] }) {
  const lote = lotes.find(l => l.id === loteId);

  const polygon = useMemo(() => {
    if (!lote?.geom) return undefined;
    try {
      // Handle GeoJSON object or string
      const geo = typeof lote.geom === 'string' ? JSON.parse(lote.geom) : lote.geom;
      if (geo?.type === 'Polygon' && geo.coordinates) {
        // Leaflet expects [lat, lng], GeoJSON is [lng, lat]
        return geo.coordinates[0].map((c: number[]) => [c[1], c[0]]) as [number, number][];
      }
    } catch (e) {
      console.warn("Failed to parse lote geometry", e);
    }
    return undefined;
  }, [lote]);

  const center: [number, number] | undefined = polygon && polygon.length > 0
    ? polygon[0]
    : undefined;

  if (!center) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 mt-2">
      <LeafletMap
        center={center}
        zoom={14}
        polygon={polygon}
        height="200px"
      />
    </div>
  );
}

// Mock data for dropdowns
const TIPOS = ["CREACION", "MANTENIMIENTO", "FINALIZACION"];
const SUBTIPOS_MAP: Record<string, string[]> = {
  CREACION: ["SIEMBRA", "PREPARACION_SUELO", "OTRA"],
  MANTENIMIENTO: ["RIEGO", "FERTILIZACION", "CONTROL_PLAGAS", "PODA", "DESYERBE", "COSECHA", "OTRA"],
  FINALIZACION: ["FINALIZACION", "OTRA"],
};

const ALL_SUBTIPOS = Object.values(SUBTIPOS_MAP).flat();

interface GeneralSectionProps {
  control: Control<ActividadFormData>;
  watch: UseFormWatch<ActividadFormData>;
  setValue: UseFormSetValue<ActividadFormData>;
  cultivos: any[];
  lotes: any[];
  subLotes?: any[];
  productosAgro?: any[]; // Added
}

export default function GeneralSection({
  control,
  watch,
  setValue,
  cultivos,
  lotes,
  subLotes = [],
  productosAgro = [],
  onProductCreated, // New prop
}: GeneralSectionProps & { onProductCreated?: (product: any) => void }) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const tipo = watch("tipo");
  const subtipo = watch("subtipo");
  const selectedLoteId = watch("loteId");
  const selectedSubLoteId = watch("subLoteId");
  const selectedCultivoId = watch("cultivoId");

  // Determine available subtypes based on selected Type
  const availableSubtipos = tipo ? SUBTIPOS_MAP[tipo] || [] : ALL_SUBTIPOS;

  const normalizedLotes = useMemo(() => lotes.map((l) => ({
    ...l,
    id: l.id ?? l.id_lote_pk ?? l.idLote,
    nombre: l.nombre ?? l.nombre_lote,
  })), [lotes]);

  const normalizedSubLotes = useMemo(() => subLotes.map((sl) => ({
    ...sl,
    id: sl.id ?? sl.id_sublote_pk ?? sl.idSublote,
    loteId: sl.loteId ?? sl.id_lote_fk ?? sl.idLote,
    nombre: sl.nombre ?? sl.nombre_sublote,
  })), [subLotes]);

  const normalizedCultivos = useMemo(() => cultivos.map((c) => ({
    ...c,
    id: c.id ?? c.id_cultivo_pk ?? c.idCultivo,
    nombreCultivo: c.nombreCultivo ?? c.nombre ?? c.nombre_cultivo,
    loteId: c.loteId ?? c.idLote ?? c.lote_id,
    subLoteId: c.subLoteId ?? c.idSublote ?? c.id_sublote_fk ?? c.subloteId,
  })), [cultivos]);

  const filteredSubLotes = selectedLoteId
    ? normalizedSubLotes.filter((sl) => sl.loteId === selectedLoteId)
    : [];

  const filteredCultivos = selectedSubLoteId
    ? normalizedCultivos.filter((c) => c.subLoteId === selectedSubLoteId)
    : selectedLoteId
      ? normalizedCultivos.filter((c) => c.loteId === selectedLoteId && !c.subLoteId)
      : [];

  const selectedCultivoNombre = selectedCultivoId
    ? normalizedCultivos.find(c => c.id === selectedCultivoId)?.nombreCultivo
    : "";

  // Auto-select Cultivo logic based on cascading rules
  useEffect(() => {
    if (!selectedLoteId) return;

    // Check if Lote has SubLotes
    const hasSubLotes = normalizedSubLotes.some(sl => sl.loteId === selectedLoteId);

    if (!hasSubLotes) {
      // Case: Lote without SubLotes -> Auto-select Cultivo directly associated
      const loteCultivos = normalizedCultivos.filter(c => c.loteId === selectedLoteId && !c.subLoteId);
      if (loteCultivos.length > 0) {
        // Enforce 1-to-1 rule: pick the first one found
        setValue("cultivoId", loteCultivos[0].id);
      } else {
        setValue("cultivoId", null as any);
      }
    } else {
      // Case: Lote has SubLotes -> Wait for SubLote selection
      if (selectedSubLoteId) {
        const subLoteCultivos = normalizedCultivos.filter(c => c.subLoteId === selectedSubLoteId);
        if (subLoteCultivos.length > 0) {
          setValue("cultivoId", subLoteCultivos[0].id);
        } else {
          setValue("cultivoId", null as any);
        }
      }
    }
  }, [selectedLoteId, selectedSubLoteId, normalizedSubLotes, normalizedCultivos, setValue]);

  return (
    <div className="space-y-6">

      {/* 1. SELECCIÓN DE TIPO Y SUBTIPO (PRIORIDAD) */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-md font-bold text-gray-700 mb-4">¿Qué tipo de actividad va a realizar?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="tipo"
            control={control}
            rules={{ required: "El tipo es requerido" }}
            render={({ field, fieldState }) => (
              <Select
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  field.onChange(val);
                  setValue("subtipo", ""); // Reset subtipo on type change
                }}
                label="Tipo Principal"
                placeholder="Ej. Creación, Mantenimiento..."
                errorMessage={fieldState.error?.message}
                isInvalid={!!fieldState.error}
                variant="faded"
                color="primary"
                className="max-w-xs"
              >
                {TIPOS.map((t) => (
                  <SelectItem key={t}>{t}</SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            name="subtipo"
            control={control}
            rules={{ required: "El subtipo es requerido" }}
            render={({ field, fieldState }) => (
              <Select
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                label="Actividad Específica"
                placeholder="Seleccione la actividad..."
                errorMessage={fieldState.error?.message}
                isInvalid={!!fieldState.error}
                variant="faded"
                isDisabled={!tipo}
                color={tipo ? "primary" : "default"}
              >
                {availableSubtipos.map((t) => (
                  <SelectItem key={t} startContent={
                    t === "SIEMBRA" ? <Sprout className="w-4 h-4 text-green-600" /> :
                      t === "COSECHA" ? <Leaf className="w-4 h-4 text-orange-600" /> :
                        t === "FINALIZACION" ? <CheckCircle2 className="w-4 h-4 text-red-600" /> :
                          null
                  }>
                    {t.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>
      </div>

      {/* 2. DATOS BÁSICOS & UBICACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Ubicación */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Ubicación</h4>
          <div className="grid grid-cols-1 gap-4">
            <Controller
              name="loteId"
              control={control}
              rules={{ required: "El lote es requerido" }}
              render={({ field, fieldState }) => (
                <Select
                  selectedKeys={field.value ? [String(field.value)] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0];
                    const newLoteId = key ? Number(key) : undefined;
                    if (newLoteId !== field.value) {
                      field.onChange(newLoteId);
                      setValue("subLoteId", undefined);
                      setValue("cultivoId", null as any);
                    }
                  }}
                  label="Lote"
                  placeholder="Seleccione lote"
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  variant="bordered"
                >
                  {normalizedLotes.map((l) => (
                    <SelectItem key={String(l.id)}>{l.nombre}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="subLoteId"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  selectedKeys={field.value ? [String(field.value)] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0];
                    const newSubLoteId = key ? Number(key) : undefined;
                    if (newSubLoteId !== field.value) {
                      field.onChange(newSubLoteId);
                      setValue("cultivoId", null as any);
                    }
                  }}
                  label="Sublote (Opcional)"
                  placeholder="Seleccione sublote"
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  variant="bordered"
                  isDisabled={!selectedLoteId || filteredSubLotes.length === 0}
                >
                  {filteredSubLotes.map((sl) => (
                    <SelectItem key={String(sl.id)}>{sl.nombre}</SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>

          {/* MAP EXTENSION */}
          {!!selectedLoteId && (
            <div className="mt-2">
              <span className="text-xs text-gray-400 mb-1 block">Ubicación del Lote</span>
              {/* Note: In a real app, we parse lote.geom. For now, we mock/try-parse if available. */}
              {/* We need to import LeafletMap. Since imports are at top, we assume it's imported or we add it in next step/multi-replace.
                   Wait, I can't add import in this chunk if it's far away.
                   I will assume I can do a second replace for imports.
                */}
              <LoteMapPreview loteId={selectedLoteId} lotes={normalizedLotes} />
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles Actividad */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Detalles</h4>
          <div className="grid grid-cols-1 gap-4">
            <Controller
              name="nombre"
              control={control}
              rules={{ required: "El nombre es requerido" }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Nombre"
                  placeholder="Ej. Cosecha Lote A"
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  variant="bordered"
                />
              )}
            />
            <Controller
              name="fecha"
              control={control}
              rules={{ required: "La fecha es requerida" }}
              render={({ field, fieldState }) => (
                <Input
                  type="date"
                  label="Fecha Realización"
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  variant="bordered"
                  {...field}
                  value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value) : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    if (date) {
                      // Adjust for timezone offset to avoid previous day issue
                      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
                      field.onChange(adjustedDate);
                    }
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* 3. CULTIVO ASOCIADO */}
      <Controller
        name="cultivoId"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            selectedKeys={field.value && field.value !== 0 ? [String(field.value)] : []}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              field.onChange(key ? Number(key) : null);
            }}
            label="Cultivo Asociado"
            placeholder="Seleccione el cultivo sobre el cual se realiza la actividad"
            errorMessage={fieldState.error?.message}
            isInvalid={!!fieldState.error}
            variant="bordered"
            color="success"
            // Auto-selection enforces disabled state if a crop is found
            isDisabled={true}
            description={
              subtipo === "COSECHA" ? "Cultivo a cosechar (Carga Automática)" :
                "El cultivo se carga automáticamente según la ubicación seleccionada."
            }
          >
            {filteredCultivos.map((c) => (
              <SelectItem key={String(c.id)} textValue={c.nombreCultivo}>
                {c.nombreCultivo}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* 4. SECCIONES DINÁMICAS POR TIPO */}

      {/* A. DATOS DE SIEMBRA */}
      {subtipo === "SIEMBRA" && (
        <Card className="bg-green-50 border-l-4 border-green-500 shadow-sm">
          <CardBody className="gap-2">
            <div className="flex items-center gap-2 text-green-800 font-bold">
              <Sprout className="w-5 h-5" />
              <span>Configuración de Siembra</span>
            </div>
            <p className="text-sm text-green-700">
              Esta actividad marcará el inicio del ciclo productivo. El cultivo <strong>{selectedCultivoNombre || "seleccionado"}</strong> pasará a estado <strong>ACTIVO</strong>.
            </p>
            <div className="mt-2 text-sm text-green-600 italic">
              * Recuerde agregar las semillas utilizadas en la pestaña "Insumos".
            </div>
          </CardBody>
        </Card>
      )}

      {/* B. DATOS DE COSECHA */}
      {subtipo === "COSECHA" && (
        <Card className="bg-orange-50 border-l-4 border-orange-500 shadow-sm">
          <CardBody className="gap-4">
            <div className="flex items-center gap-2 text-orange-800 font-bold">
              <Leaf className="w-5 h-5" />
              <span>Registro de Cosecha / Producción</span>
            </div>

            <div className="p-4 bg-white rounded-md border border-orange-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600 block">Producto a Cosechar: </span>
                <Button 
                  size="sm" 
                  color="warning" 
                  variant="flat" 
                  startContent={<Plus size={16} />}
                  onPress={() => setIsProductModalOpen(true)}
                >
                  Nuevo Producto
                </Button>
              </div>
              <Controller
                name="productoAgroId"
                control={control}
                rules={{ required: subtipo === "COSECHA" ? "Debe seleccionar un producto" : false }}
                render={({ field, fieldState }) => (
                  <Select
                    selectedKeys={field.value ? [String(field.value)] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0];
                      field.onChange(key ? Number(key) : undefined);
                    }}
                    label="Seleccione Producto"
                    placeholder="Ej. Papaya, Tomate..."
                    errorMessage={fieldState.error?.message}
                    isInvalid={!!fieldState.error}
                    variant="bordered"
                    color="warning"
                    items={productosAgro || []}
                  >
                    {(product: any) => (
                      <SelectItem key={String(product.id)} textValue={product.nombre}>
                        {product.nombre}
                      </SelectItem>
                    )}
                  </Select>
                )}
              />
            </div>
            
            <CreateProductModal 
              isOpen={isProductModalOpen} 
              onClose={() => setIsProductModalOpen(false)}
              onSuccess={(newProduct) => {
                if(onProductCreated) onProductCreated(newProduct);
                setValue("productoAgroId", newProduct.id); // Auto-select new product
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="cantidadPlantas"
                control={control}
                rules={{ required: subtipo === "COSECHA" ? "Este campo es requerido" : false }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={field.value !== undefined ? String(field.value) : ""}
                    label="¿Cuántos palos/plantas se cosecharon?"
                    placeholder="0"
                    type="number"
                    variant="bordered"
                    errorMessage={fieldState.error?.message}
                    isInvalid={!!fieldState.error}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="kgRecolectados"
                control={control}
                rules={{ required: subtipo === "COSECHA" ? "Este campo es requerido" : false }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={field.value !== undefined ? String(field.value) : ""}
                    label="Cantidad Recolectada (Kg/Und)"
                    placeholder="0.00"
                    type="number"
                    variant="bordered"
                    errorMessage={fieldState.error?.message}
                    isInvalid={!!fieldState.error}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    endContent={<div className="pointer-events-none flex items-center"><span className="text-default-400 text-small">Kg</span></div>}
                  />
                )}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* C. DATOS DE FINALIZACIÓN */}
      {subtipo === "FINALIZACION" && (
        <Card className="bg-red-50 border-l-4 border-red-500 shadow-sm">
          <CardBody className="gap-2">
            <div className="flex items-center gap-2 text-red-800 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Finalización de Cultivo</span>
            </div>
            <p className="text-sm text-red-700">
              ¡Atención! Al guardar esta actividad, el cultivo <strong>{selectedCultivoNombre || "seleccionado"}</strong> se marcará como <strong>FINALIZADO</strong>.
              Esto cierra el ciclo productivo y no se podrán agregar más actividades operativas.
            </p>
          </CardBody>
        </Card>
      )}

      <Controller
        name="descripcion"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Notas Adicionales"
            placeholder="Describa detalles adicionales de la actividad..."
            variant="bordered"
            minRows={2}
          />
        )}
      />
    </div>
  );
}
