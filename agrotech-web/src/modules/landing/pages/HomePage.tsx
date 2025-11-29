import React, { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  Sprout,
  Bug,
  FileBarChart,
  Thermometer,
  Droplets,
  Sun,
  Gauge,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* =========================
 * Variants globales
 * ========================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  // cast transition to any because Framer Motion's `ease` typing can be strict
  show: { opacity: 1, y: 0, transition: ({ duration: 0.35, ease: "easeOut" } as any) },
};

const fadeIn = {
  hidden: { opacity: 0 },
  // cast transition to any because Framer Motion's `ease` typing can be strict
  show: { opacity: 1, transition: ({ duration: 0.35, ease: "easeOut" } as any) },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const floatHover = {
  rest: { y: 0, scale: 1 },
  // cast spring transitions to any to satisfy types
  hover: { y: -3, scale: 1.02, transition: ({ type: "spring", stiffness: 220, damping: 16 } as any) },
  tap: { scale: 0.98 },
};

export default function Home() {
  const { setTitle } = useOutletContext<LayoutContext>();
  useEffect(() => setTitle("Inicio"), [setTitle]);

  return (
    <>
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <HeroCarousel />
      </motion.section>

      <motion.section
        className="mt-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <SensorsCard />
      </motion.section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Card shadow="sm">
            <CardBody className="p-5">
              <motion.div
                className="grid grid-cols-3 gap-4"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={fadeInUp}>
                  <Kpi icon={<Sprout className="h-6 w-6" />} label="Cultivos activos" value="14" />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Kpi icon={<Bug className="h-6 w-6" />} label="Alertas activas" value="3" />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Kpi icon={<FileBarChart className="h-6 w-6" />} label="Reportes generados" value="5" />
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-6 h-2 w-full rounded bg-default-200 overflow-hidden"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              >
                <div className="h-full w-2/2 bg-success rounded" />
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Card shadow="sm">
            <CardBody className="p-5">
              <h3 className="text-lg font-semibold mb-4">Últimas actividades</h3>
              <motion.ul
                className="space-y-4"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                <motion.li variants={fadeInUp}>
                  <ActivityRow text="Se fertilizó el cultivo H333 por el aprendiz Juanita" date="15/7/25" time="8:00 AM" />
                </motion.li>
                <motion.li variants={fadeInUp}>
                  <ActivityRow text="Se registró una venta del cultivo H212" date="12/7/25" time="7:00 AM" />
                </motion.li>
                <motion.li variants={fadeInUp}>
                  <ActivityRow text="Se registró limpieza del suelo en el cultivo H432" date="27/7/25" time="5:00 PM" />
                </motion.li>
              </motion.ul>

              <motion.div
                className="mt-5 flex justify-end"
                variants={fadeIn}
              >
                <motion.div variants={floatHover} whileHover="hover" whileTap="tap" initial="rest" animate="rest">
                  <Button variant="flat" color="success" endContent={<ChevronRight className="h-4 w-4" />}>
                    Ver más
                  </Button>
                </motion.div>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </section>

      <motion.section
        className="mt-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeInUp}
      >
        <h3 className="text-center text-lg font-semibold mb-4">
          Rentabilidad de los últimos 3 meses
        </h3>
        <Card shadow="sm">
          <CardBody className="p-6">
            <motion.div
              className="flex items-end gap-4 h-40"
              variants={listStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[{ h: 40 }, { h: 64 }, { h: 80 }, { h: 56 }, { h: 92 }, { h: 70 }].map((b, i) => (
                <motion.div
                  key={i}
                  className="flex-1 grid place-items-end"
                  variants={fadeInUp}
                >
                  <motion.div
                    className="w-7 rounded-t bg-success/80"
                    style={{ height: `${b.h}%` }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 180, damping: 18, delay: i * 0.05 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </CardBody>
        </Card>
      </motion.section>
    </>
  );
}

/* =========================
 * Hero con transiciones
 * ========================= */
function HeroCarousel() {
  const slides = [
    { id: 1, img: "/FondoLogin.jpeg", title: "Cultivo: H201", subtitle: "Cacao de brasil" },
    { id: 2, img: "/FondoLogin.jpeg", title: "Cultivo: H201", subtitle: "Cacao de brasil" },
    { id: 3, img: "/FondoLogin.jpeg", title: "Cultivo: H201", subtitle: "Cacao de brasil" },
  ];

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 4000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  const go = (n: number) => setIdx((n + slides.length) % slides.length);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeInUp}
    >
      <Card shadow="sm" className="overflow-hidden rounded-xl">
        <div
          className="relative h-52 md:h-60"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute inset-0">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={slides[idx].id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -25 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <img
                  src={slides[idx].img}
                  alt={slides[idx].title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/55" />

                <motion.div
                  className="absolute left-5 md:left-8 top-5 md:top-8 text-white"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.05 }}
                >
                  <p className="text-2xl md:text-3xl font-bold">{slides[idx].title}</p>
                  <p className="opacity-95">{slides[idx].subtitle}</p>
                </motion.div>

                <motion.div
                  className="absolute left-5 md:left-8 bottom-5"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.15 }}
                >
                  <motion.div variants={floatHover} whileHover="hover" whileTap="tap" initial="rest" animate="rest">
                    <Button
                      variant="solid"
                      radius="full"
                      onPress={() => navigate("/cultivos")}
                      className="
                        bg-emerald-600 text-white h-9 px-4 text-sm font-medium
                        hover:bg-emerald-700 active:bg-emerald-800
                        opacity-100 data-[hover=true]:opacity-100 data-[pressed=true]:opacity-100
                      "
                      endContent={<ChevronRight className="h-4 w-4" />}
                    >
                      Ver más detalles
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controles */}
          <motion.button
            onClick={() => go(idx - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/40"
            aria-label="Anterior"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={() => go(idx + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/40"
            aria-label="Siguiente"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>

          {/* Dots + barra de progreso */}
          <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-2 px-4">
            <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <motion.span
                  key={i}
                  onClick={() => go(i)}
                  className={`h-2 w-2 rounded-full cursor-pointer ${i === idx ? "bg-white" : "bg-white/50"}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
            <motion.div
              className="h-0.5 w-32 bg-white/30 overflow-hidden rounded"
              initial={false}
              key={`bar-${idx}-${paused}`}
            >
              <motion.div
                className="h-full bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: paused ? 0 : 1 }}
                transition={{ duration: 4, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* =========================
 * Sensores con stagger
 * ========================= */
function SensorsCard() {
  const items = [
    { icon: <Thermometer className="h-4 w-4" />, label: "Temperatura", value: "32°" },
    { icon: <Droplets className="h-4 w-4" />, label: "Humedad", value: "79%" },
    { icon: <Sun className="h-4 w-4" />, label: "Soleado", value: "" },
    { icon: <Gauge className="h-4 w-4" />, label: "Sensor pH", value: "3.5" },
  ];

  return (
    <Card shadow="sm">
      <CardBody className="p-0">
        <motion.div
          className="p-4 md:p-5 space-y-3"
          variants={listStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {items.map((it, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between text-foreground-600"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <span className="text-success">{it.icon}</span>
                <span className="text-sm">{it.label}</span>
              </div>
              <span className="text-sm font-medium">{it.value || ""}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="px-4 md:px-5 pb-4">
          <motion.div variants={floatHover} whileHover="hover" whileTap="tap" initial="rest" animate="rest">
            <Button variant="flat" color="success" className="w-full">
              Ver actividades
            </Button>
          </motion.div>
        </div>
      </CardBody>
    </Card>
  );
}

/* =========================
 * KPI con micro-interacciones
 * ========================= */
function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-2"
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="h-10 w-10 rounded-full bg-default-200 grid place-items-center">
        <span className="text-foreground-700">{icon}</span>
      </div>
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="text-xs text-foreground-500 text-center">{label}</div>
    </motion.div>
  );
}

/* =========================
 * Fila de actividad
 * ========================= */
function ActivityRow({ text, date, time }: { text: string; date: string; time: string }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: ("easeOut" as any) }}
      whileHover={{ scale: 1.01 }}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-success shrink-0" />
      <p className="flex-1 text-sm text-foreground-700">{text}</p>
      <div className="text-xs text-foreground-500 flex items-center gap-3 shrink-0">
        <span>{date}</span>
        <span>{time}</span>
      </div>
    </motion.div>
  );
}
