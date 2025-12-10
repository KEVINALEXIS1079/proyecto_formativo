import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useCultivosList } from "@/modules/cultivos/hooks/useCultivos";
import { useActividades } from "@/modules/actividad/hooks/useActividades";
import { IoTApi } from "@/modules/iot/api/iot.api";
import type { Sensor } from "@/modules/iot/model/iot.types";
import type { Cultivo } from "@/modules/cultivos/model/types";
import { useLotesList } from "@/modules/cultivos/hooks/useLotes";
import { useIoTRealTimeSensors } from "@/modules/iot/hooks/useIoTRealTimeSensors";

import HeroCarousel, { type Slide } from "../components/HeroCarousel";
import SensorCard from "../components/SensorCard";
import ActivityRow, { ChipPill } from "../components/ActivityRow";

/* =========================
 * Variantes
 * ========================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: ({ duration: 0.35, ease: "easeOut" } as any) },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: ({ duration: 0.35, ease: "easeOut" } as any) },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export default function Home() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  const { data: cultivos = [], isLoading: cultivosLoading } = useCultivosList({ page: 1, limit: 200 });
  const { data: actividades = [], isLoading: actividadesLoading } = useActividades();
  const { data: lotes = [] } = useLotesList();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loadingSensors, setLoadingSensors] = useState(true);
  const { realTimeSensors, getFormattedSensorData } = useIoTRealTimeSensors(sensors);

  useEffect(() => setTitle("Inicio"), [setTitle]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await IoTApi.getSensors();
        if (mounted) setSensors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando sensores", err);
        if (mounted) setSensors([]);
      } finally {
        if (mounted) setLoadingSensors(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const heroSlides: Slide[] = useMemo(() => {
    const conImagen = (cultivos as Cultivo[])
      .filter((c) => !!c.imagen)
      .slice(0, 5)
      .map((c) => {
        const tipo = typeof c.tipoCultivo === "string" ? c.tipoCultivo : c.tipoCultivo?.nombre;
        const lote = c.sublote?.nombre ? `Sublote ${c.sublote.nombre}` : c.lote?.nombre ? `Lote ${c.lote.nombre}` : "Ubicación no definida";
        return {
          id: c.id,
          img: c.imagen,
          title: c.nombre,
          subtitle: [tipo, lote].filter(Boolean).join(" - "),
        };
      });

    if (conImagen.length > 0) return conImagen;

    const sinImagen = (cultivos as Cultivo[]).slice(0, 5).map((c) => {
      const tipo = typeof c.tipoCultivo === "string" ? c.tipoCultivo : c.tipoCultivo?.nombre;
      const lote = c.sublote?.nombre ? `Sublote ${c.sublote.nombre}` : c.lote?.nombre ? `Lote ${c.lote.nombre}` : "Ubicación no definida";
      return {
        id: c.id,
        img: c.imagen || "/FondoLogin.jpeg",
        title: c.nombre,
        subtitle: [tipo, lote].filter(Boolean).join(" - "),
      };
    });

    if (sinImagen.length > 0) return sinImagen;

    return [
      { id: "fallback-1", img: "/FondoLogin.jpeg", title: "Gestión de cultivos", subtitle: "Monitorea lotes, sublotes y actividades" },
      { id: "fallback-2", img: "/FondoLogin.jpeg", title: "Seguimiento IoT", subtitle: "Temperatura, humedad y más en tiempo real" },
    ];
  }, [cultivos]);

  const actividadesRecientes = useMemo(() => {
    return [...(actividades || [])]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 4);
  }, [actividades]);

  const sensoresPorLote = useMemo(() => {
    return [...(realTimeSensors || [])]
      .filter((s) => s.activo && s.loteId)
      .sort((a, b) => new Date(b.ultimaLectura || 0).getTime() - new Date(a.ultimaLectura || 0).getTime());
  }, [realTimeSensors]);

  const lotSlides = useMemo(() => {
    const map = new Map<number, { loteId: number; nombre: string; sensors: Sensor[] }>();
    sensoresPorLote.forEach((s) => {
      if (!s.loteId) return;
      const nombre = lotes.find((l: any) => l.id === s.loteId)?.nombre || `Lote ${s.loteId}`;
      if (!map.has(s.loteId)) {
        map.set(s.loteId, { loteId: s.loteId, nombre, sensors: [] });
      }
      map.get(s.loteId)?.sensors.push(s);
    });
    return Array.from(map.values());
  }, [sensoresPorLote, lotes]);

  const [lotIdx, setLotIdx] = useState(0);

  useEffect(() => {
    setLotIdx(0);
  }, [lotSlides.length]);

  useEffect(() => {
    if (!lotSlides.length) return;
    const id = window.setInterval(() => {
      setLotIdx((i) => (i + 1) % lotSlides.length);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [lotSlides.length]);

  return (
    <div className="w-full space-y-6 overflow-hidden pb-6 px-4 md:px-6">
      <motion.section initial="hidden" animate="show" variants={fadeIn}>
        <HeroCarousel slides={heroSlides} onNavigateCultivos={() => navigate("/cultivos")} />
      </motion.section>

      <section className="grid grid-cols-1 gap-4">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
          <Card shadow="sm" className="border border-default-200 h-full">
            <CardBody className="p-6 space-y-5 bg-gradient-to-br from-emerald-50/40 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground-500 uppercase tracking-wide">Sensores</p>
                  <h3 className="text-lg font-semibold">Monitoreo por lote</h3>
                </div>
                <Button size="sm" variant="flat" color="success" onPress={() => navigate("/iot")}>
                  Abrir panel IoT
                </Button>
              </div>

              {loadingSensors ? (
                <p className="text-sm text-foreground-500">Cargando sensores...</p>
              ) : lotSlides.length === 0 ? (
                <p className="text-sm text-foreground-500">No hay sensores activos por lote.</p>
              ) : (
                <div className="border-t border-default-200 pt-4">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={lotSlides[lotIdx]?.loteId ?? "empty"}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="space-y-3"
                      >
                        <p className="text-sm font-semibold text-foreground-800">
                          {lotSlides[lotIdx]?.nombre || "Sin lote"}
                        </p>
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {lotSlides[lotIdx]?.sensors.map((s) => (
                            <SensorCard
                              key={s.id}
                              name={s.nombre}
                              valor={getFormattedSensorData(s.id)?.value ?? s.ultimoValor}
                              unidad={getFormattedSensorData(s.id)?.unit ?? s.tipoSensor?.unidad}
                              fecha={getFormattedSensorData(s.id)?.timestamp ?? s.ultimaLectura}
                              estado={getFormattedSensorData(s.id)?.estadoConexion || s.estadoConexion || (s.activo ? "CONECTADO" : "DESCONECTADO")}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    {lotSlides.length > 1 && (
                      <div className="flex justify-center gap-2 mt-3">
                        {lotSlides.map((_, i) => (
                          <span
                            key={i}
                            onClick={() => setLotIdx(i)}
                            className={`h-2 w-2 rounded-full cursor-pointer ${i === lotIdx ? "bg-emerald-500" : "bg-default-300"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
          <Card shadow="sm" className="border border-default-200 h-full">
            <CardBody className="p-6 space-y-5 bg-gradient-to-br from-white to-emerald-50/30 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground-500 uppercase tracking-wide">Actividades</p>
                  <h3 className="text-lg font-semibold">Últimos movimientos</h3>
                </div>
                <Button size="sm" variant="flat" color="primary" onPress={() => navigate("/actividades")}>
                  Ver todo
                </Button>
              </div>

              {actividadesLoading ? (
                <p className="text-sm text-foreground-500">Cargando actividades...</p>
              ) : actividadesRecientes.length === 0 ? (
                <p className="text-sm text-foreground-500">No hay actividades registradas.</p>
              ) : (
                <motion.ul className="space-y-3" variants={listStagger} initial="hidden" animate="show">
                  {actividadesRecientes.map((a) => {
                    const cultivoNombre = a.cultivo?.nombre || (a.cultivoId ? `Cultivo ${a.cultivoId}` : "Sin cultivo");
                    const fecha = new Date(a.fecha);
                    const fechaStr = isNaN(fecha.getTime()) ? "" : fecha.toLocaleDateString("es-CO");
                    const horaStr = isNaN(fecha.getTime()) ? "" : fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <motion.li key={a.id} variants={fadeInUp}>
                        <ActivityRow text={`${a.tipo} - ${cultivoNombre}`} date={fechaStr} time={horaStr} />
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
          <Card shadow="sm" className="border border-default-200 h-full">
            <CardBody className="p-6 space-y-5 bg-gradient-to-br from-white to-emerald-50/20 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cultivos destacados</h3>
                <Button size="sm" variant="light" color="success" onPress={() => navigate("/cultivos")}>
                  Ir a cultivos
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {(cultivos as Cultivo[]).slice(0, 4).map((c) => {
                  const tipo = typeof c.tipoCultivo === "string" ? c.tipoCultivo : c.tipoCultivo?.nombre;
                  const lote = c.sublote?.nombre || c.lote?.nombre || "Ubicación no definida";
                  return (
                    <div key={c.id} className="rounded-xl border border-default-200 p-3 bg-gradient-to-br from-white to-emerald-50/40 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground-800 line-clamp-1">{c.nombre}</p>
                          <p className="text-xs text-foreground-500 line-clamp-1">{tipo || "Tipo sin definir"}</p>
                        </div>
                        <ChipPill label={c.estado} />
                      </div>
                      <p className="text-xs text-foreground-500 mt-2 line-clamp-1">{lote}</p>
                    </div>
                  );
                })}
                {cultivosLoading && <p className="text-sm text-foreground-500">Cargando cultivos...</p>}
                {!cultivosLoading && cultivos.length === 0 && <p className="text-sm text-foreground-500">No hay cultivos registrados.</p>}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
