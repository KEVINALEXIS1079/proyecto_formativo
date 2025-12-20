import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 1.0, ease: "easeOut" as const } },
};

const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: 0.3, delayChildren: 0.3 } },
};

export default function LandingHero() {
    return (
        <section className="relative overflow-hidden">
            {/* Fondo con Efecto "Vuelo de Dron" sobre Platanal */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.15, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 18, ease: "easeOut" }}
            >
                <img
                    src="/FondoLogin.jpeg"
                    alt="Cultivo de plátano"
                    className="h-full w-full object-cover object-center brightness-[0.9] saturate-[1.15]" // Más saturación para resaltar los verdes
                />
            </motion.div>

            {/* Capa de Grano Cinematográfico (Noise) */}
            <div className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
            />

            {/* Degradados Atmosféricos Mejorados */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/50 to-black/30 mix-blend-multiply z-0" />

            {/* Efecto "God Rays" (Rayos de Sol) Animados */}
            <motion.div
                className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-yellow-100/10 via-transparent to-transparent z-0 opacity-60"
                initial={{ opacity: 0, rotate: -5 }}
                animate={{ opacity: [0.3, 0.5, 0.3], rotate: 0 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />

            {/* Luz cenital suave para profundidad */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,0,0,0)_0%,rgba(0,20,10,0.5)_100%)] z-0" />

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
                        >
                            <span>Gestiona tus Cultivos</span>
                            <br className="hidden md:block" />
                            <span>con Inteligencia</span>
                        </motion.h1>

                        <motion.p
                            className="mt-5 max-w-2xl mx-auto text-sm md:text-base lg:text-lg text-white/90"
                            variants={fadeInUp}
                        >
                            Optimiza, planifica y analiza cada etapa de tu producción. Todo en un solo lugar,
                            con datos claros y decisiones más rápidas.
                        </motion.p>

                        <motion.div
                            className="mt-8 flex items-center justify-center gap-3 md:gap-4"
                            variants={fadeInUp}
                        >
                            <Link
                                to="/register"
                                className="
                                    rounded-full px-7 py-3 font-medium
                                    bg-emerald-600 text-white
                                    hover:bg-emerald-700
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
