import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: ({ duration: 0.55, ease: [0.22, 1, 0.36, 1] } as any) },
};

const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

export default function LandingHero() {
    return (
        <section className="relative overflow-hidden">
            {/* Fondo */}
            <img
                src="/FondoLogin.jpeg"
                alt="Fondo agrícola"
                className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Radial + degradado */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),rgba(0,0,0,0.8))]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

            {/* Blobs con animación lenta (no cambia color) */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-green-400/20 blur-3xl animate-ping"
            />

            {/* Contenido */}
            <div className="relative z-10">
                <div className="mx-auto max-w-7xl px-5 min-h-[66dvh] md:min_h-[70dvh] grid place-items-center">
                    <motion.div
                        className="text-center text-white"
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.4 }}
                    >
                        <motion.span
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs ring-1 ring-white/20"
                            variants={fadeInUp}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Plataforma para productores y empresas
                        </motion.span>

                        <motion.h1
                            className="mt-4 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
                            variants={fadeInUp}
                            transition={{ delay: 0.05 }}
                        >
                            Gestiona tus Cultivos
                            <br className="hidden md:block" />
                            con Inteligencia
                        </motion.h1>

                        <motion.p
                            className="mt-5 max-w-2xl mx-auto text-sm md:text-base lg:text-lg text-white/90"
                            variants={fadeInUp}
                            transition={{ delay: 0.12 }}
                        >
                            Optimiza, planifica y analiza cada etapa de tu producción. Todo en un solo lugar,
                            con datos claros y decisiones más rápidas.
                        </motion.p>

                        <motion.div
                            className="mt-8 flex items-center justify-center gap-3 md:gap-4"
                            variants={fadeInUp}
                            transition={{ delay: 0.18 }}
                        >
                            <Link
                                to="/register"
                                className="
                                    rounded-full px-7 py-3 font-medium
                                    bg-white text-emerald-700
                                    hover:bg-gray-100
                                    shadow-sm hover:shadow-lg
                                    transition-all
                                "
                            >
                                Comenzar
                            </Link>
                            <a
                                href="#caracteristicas"
                                className="
                  rounded-full px-6 py-3 font-medium
                  border border-white/70 text-white
                  hover:bg-white/10
                  transition-colors
                "
                            >
                                Más información
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
