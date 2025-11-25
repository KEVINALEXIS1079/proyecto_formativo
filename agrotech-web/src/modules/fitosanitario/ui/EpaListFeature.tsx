import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Tab, Tabs, Select, SelectItem, Card, CardBody } from "@heroui/react";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import EpaCard from "../widgets/EpaCard";
import { useEpaList, useTipoEpaList, useTipoCultivoEpaList } from "../hooks/useFitosanitario";
import { useFitosanitarioRealtime } from "../hooks/useFitosanitarioRealtime";
import type { TipoEpaEnum } from "../model/types";

// Variants de animación simplificados
const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const hoverCard = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.01 },
};

export default function EpaListFeature() {
  const navigate = useNavigate();

  // Estados de filtros
  const [q, setQ] = useState("");
  const [debouncedQ] = useDebounce(q, 400); // debounce 400ms
  const [tipoEpaFilter, setTipoEpaFilter] = useState<TipoEpaEnum | "todos">("todos");
  const [tipoCultivoEpaId, setTipoCultivoEpaId] = useState<number | undefined>();

  // Datos de listas para filtros
  const { data: tiposEpa = [] } = useTipoEpaList();
  const { data: tiposCultivoEpa = [] } = useTipoCultivoEpaList();

  // Habilitar actualizaciones en tiempo real
  useFitosanitarioRealtime();

  // Calcular tipoId basado en el filtro de tabs
  const tipoId = useMemo(() => {
    if (tipoEpaFilter === "todos") return undefined;
    const tipo = tiposEpa.find(t => t.tipoEpaEnum === tipoEpaFilter);
    return tipo?.id;
  }, [tipoEpaFilter, tiposEpa]);

  // Hook de lista con filtros
  const { data, isLoading } = useEpaList({
    q: debouncedQ,
    tipoId,
    tipoCultivoEpaId,
    page: 1,
    limit: 50, // Mostrar más en grid
  });

  const items = useMemo(() => data?.items ?? [], [data]);

  // Handlers
  const handleViewDetail = useCallback((epa: any) => {
    navigate(`/fitosanitario/${epa.id}`);
  }, [navigate]);

  const handleEdit = useCallback((epa: any) => {
    navigate(`/fitosanitario/${epa.id}/editar`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate("/fitosanitario/crear");
  }, [navigate]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <motion.div initial="hidden" animate="show" variants={fadeIn}>
        <h1 className="text-3xl font-bold text-default-900">Módulo fitosanitario</h1>
      </motion.div>

      {/* Controles */}
      <motion.div initial="hidden" animate="show" variants={fadeInUp} className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Búsqueda */}
          <div className="flex-1 min-w-0">
            <Input
              label="Buscar EPA"
              placeholder="Nombre, descripción..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              startContent={<Search size={16} />}
              className="max-w-md"
            />
          </div>

          {/* Filtro Tipo EPA (Tabs) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tipo EPA</label>
            <Tabs
              selectedKey={tipoEpaFilter}
              onSelectionChange={(key) => setTipoEpaFilter(key as TipoEpaEnum | "todos")}
              size="sm"
              variant="bordered"
            >
              <Tab key="todos" title="Todos" />
              <Tab key="enfermedad" title="Enfermedad" />
              <Tab key="plaga" title="Plaga" />
              <Tab key="arvense" title="Arvencia" />
            </Tabs>
          </div>

          {/* Filtro Tipo Cultivo EPA */}
          <div className="min-w-0">
            <Select
              label="Tipo Cultivo EPA"
              placeholder="Todos los cultivos"
              selectedKeys={tipoCultivoEpaId ? new Set([String(tipoCultivoEpaId)]) : new Set()}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>);
                setTipoCultivoEpaId(selected.length > 0 ? Number(selected[0]) : undefined);
              }}
              className="min-w-48"
            >
              {tiposCultivoEpa.map((tipo) => (
                <SelectItem key={String(tipo.id)} textValue={tipo.nombre}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Botón Nueva EPA */}
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={handleCreateNew}
            className="whitespace-nowrap"
          >
            Nueva EPA
          </Button>
        </div>
      </motion.div>

      {/* Grid de EPAs */}
      <motion.div initial="hidden" animate="show" variants={listStagger}>
        {isLoading ? (
          <motion.div
            className="py-12 text-center text-default-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Cargando EPAs...
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card>
              <CardBody className="py-12 text-center">
                <p className="text-default-500">
                  {debouncedQ || tipoId || tipoCultivoEpaId
                    ? "No se encontraron EPAs con los filtros aplicados."
                    : "No hay EPAs registrados aún."}
                </p>
                {!debouncedQ && !tipoId && !tipoCultivoEpaId && (
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus size={16} />}
                    onPress={handleCreateNew}
                    className="mt-4"
                  >
                    Crear el primer EPA
                  </Button>
                )}
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {items.map((epa) => (
              <motion.div key={epa.id} variants={hoverCard} initial="rest" whileHover="hover">
                <EpaCard
                  epa={epa}
                  onViewDetail={handleViewDetail}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}