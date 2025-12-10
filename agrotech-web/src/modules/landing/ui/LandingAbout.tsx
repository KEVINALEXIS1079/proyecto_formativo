import { motion } from "framer-motion";

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: ({ duration: 0.55, ease: [0.22, 1, 0.36, 1] } as any) },
};

const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

export default function LandingAbout() {
    return (
        <section id="acerca" className="bg-gray-50">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] gap-10 items-center">
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold tracking-tight"
                            variants={fadeInUp}
                        >
                            Acerca de AgroTech
                        </motion.h2>
                        <motion.p
                            className="mt-4 text-lg text-foreground-600 leading-relaxed"
                            variants={fadeInUp}
                            transition={{ delay: 0.06 }}
                        >
                            Conectamos innovación y sostenibilidad para ayudarte a gestionar tus cultivos con
                            herramientas modernas de monitoreo, análisis y digitalización. Diseñado para ser
                            simple y potente, tanto para pequeños productores como para empresas agrícolas.
                        </motion.p>
                        <motion.div
                            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
                            variants={stagger}
                            transition={{ delayChildren: 0.08 }}
                        >
                            <motion.div
                                className="rounded-xl bg-white ring-1 ring-default-200 p-4"
                                variants={fadeInUp}
                            >
                                <p className="text-sm text-foreground-500">Ahorro en costos</p>
                                <p className="text-2xl font-semibold">hasta 25%</p>
                            </motion.div>
                            <motion.div
                                className="rounded-xl bg-white ring-1 ring-default-200 p-4"
                                variants={fadeInUp}
                            >
                                <p className="text-sm text-foreground-500">Procesos digitalizados</p>
                                <p className="text-2xl font-semibold">+40</p>
                            </motion.div>
                            <motion.div
                                className="rounded-xl bg-white ring-1 ring-default-200 p-4"
                                variants={fadeInUp}
                            >
                                <p className="text-sm text-foreground-500">Alertas y métricas</p>
                                <p className="text-2xl font-semibold">en tiempo real</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-default-200 shadow-md">
                            <img
                                src="/FondoLogin.jpeg"
                                alt="Cultivo"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <motion.div
                            className="absolute -bottom-4 -right-4 hidden sm:block rounded-xl bg-white/90 backdrop-blur ring-1 ring-default-200 px-4 py-3 shadow"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
                            viewport={{ once: true }}
                        >
                            <p className="text-sm">
                                “Una plataforma clara para planificar y decidir mejor.”
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
