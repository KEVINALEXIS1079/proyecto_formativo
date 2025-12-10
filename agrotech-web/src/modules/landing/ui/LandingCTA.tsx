import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: ({ duration: 0.55, ease: [0.22, 1, 0.36, 1] } as any) },
};

export default function LandingCTA() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-600" />
            <motion.div
                className="relative mx-auto max-w-7xl px-6 py-16 text-center text-white"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.35 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    ¿Listo para transformar tu cultivo?
                </h2>
                <p className="mt-3 text-lg opacity-90">
                    Empieza hoy a digitalizar tu producción agrícola con AgroTech.
                </p>
                <Link
                    to="/register"
                    className="
            inline-flex items-center justify-center
            mt-6 rounded-full bg-white text-emerald-700
            px-8 py-3 font-medium shadow-sm hover:shadow-lg
            hover:bg-gray-100 transition-all
          "
                >
                    Crear cuenta gratis
                </Link>
            </motion.div>

            {/* decor (brillos suaves con animación) */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-10 left-1/3 h-44 w-44 rounded-full bg-white/10 blur-2xl animate-pulse"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 right-1/4 h-52 w-52 rounded-full bg-white/10 blur-2xl animate-pulse"
            />
        </section>
    );
}
