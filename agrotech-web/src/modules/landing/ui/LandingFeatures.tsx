import { motion } from "framer-motion";
import { Activity, Boxes, LineChart } from "lucide-react";

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: ({ duration: 0.55, ease: [0.22, 1, 0.36, 1] } as any) },
};

const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const tiltHover = {
    rest: { rotateX: 0, rotateY: 0, y: 0, transition: ({ type: "spring", stiffness: 300, damping: 20 } as any) },
    hover: { rotateX: -2.5, rotateY: 2.5, y: -4, transition: ({ type: "spring", stiffness: 300, damping: 18 } as any) },
};

function Feature({
    title,
    text,
    icon,
}: { title: string; text: string; icon?: React.ReactNode }) {
    const featureVariants = {
        initial: fadeInUp.initial,
        animate: fadeInUp.animate,
        rest: tiltHover.rest,
        hover: tiltHover.hover,
    } as any;

    return (
        <motion.div
            className="
        group relative rounded-2xl p-6 md:p-8
        bg-white/70 dark:bg-white/60 backdrop-blur
        ring-1 ring-default-200 hover:ring-success/50
        shadow-sm hover:shadow-lg transition-all duration-300
        will-change-transform
      "
            variants={featureVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.35 }}
            whileHover="hover"
            animate="rest"
            style={{ transformStyle: "preserve-3d" }}
        >
            {icon && (
                <div
                    className="
            absolute -top-6 left-6
            h-12 w-12 rounded-xl
            bg-gradient-to-br from-emerald-500/15 to-green-500/15
            ring-1 ring-success/30 grid place-items-center
            shadow-sm
          "
                    style={{ transform: "translateZ(20px)" }}
                >
                    <span className="text-success">{icon}</span>
                </div>
            )}

            <div className="pt-6">
                <h3 className="text-lg md:text-xl font-semibold tracking-tight">
                    {title}
                </h3>
                <p className="mt-2 text-sm md:text-base text-foreground-500 leading-relaxed">
                    {text}
                </p>

                <div
                    className="
            mt-6 h-px bg-gradient-to-r from-transparent via-default-200 to-transparent
            opacity-80 group-hover:opacity-100 transition-opacity
          "
                />
            </div>
        </motion.div>
    );
}

export default function LandingFeatures() {
    return (
        <section id="caracteristicas" className="relative">
            <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                    variants={stagger}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <Feature
                        title="Monitoreo inteligente"
                        text="Métricas y alertas en tiempo real para la salud de tus cultivos y el estado de los lotes."
                        icon={<Activity className="h-6 w-6" />}
                    />
                    <Feature
                        title="Gestión de recursos"
                        text="Planifica y controla insumos, mano de obra y costos con flujos simples y efectivos."
                        icon={<Boxes className="h-6 w-6" />}
                    />
                    <Feature
                        title="Análisis de datos"
                        text="Paneles de rendimiento e históricos para decisiones más rápidas y precisas."
                        icon={<LineChart className="h-6 w-6" />}
                    />
                </motion.div>

                {/* logos */}
                <motion.div
                    className="mt-14 flex items-center justify-center gap-16 opacity-95"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.35 }}
                >
                    <img src="/LogoTic.png" alt="TIC" className="h-16 md:h-20 w-auto object-contain" />
                    <img src="/logoSena.png" alt="SENA" className="h-14 md:h-18 w-auto object-contain" />
                </motion.div>
            </div>
        </section>
    );
}
