import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const fadeDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function LandingHeader() {
    const [open, setOpen] = useState(false);
    const [isDecember, setIsDecember] = useState(false);

    useEffect(() => {
        const month = new Date().getMonth();
        setIsDecember(month === 11); // 11 = December
    }, []);

    return (
        <motion.header
            className="sticky top-0 z-40 border-b border-default-200/70 bg-white/80 backdrop-blur-md"
            variants={fadeDown}
            initial="initial"
            animate="animate"
        >
            <div className="mx-auto max-w-7xl h-16 px-5 flex items-center gap-4">
                <a href="/" className="flex items-center gap-2">
                    <div className="relative">
                        <img
                            src="/logoAgrotech.png"
                            alt="AgroTech"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                        {/* Gorro de Navidad animado (Solo en Diciembre) */}
                        {/* Gorro de Navidad animado (Solo en Diciembre) */}
                        {isDecember && (
                            <svg
                                viewBox="0 0 120 100"
                                className="absolute -top-4 -left-3 w-12 h-12 md:w-14 md:h-14 rotate-[-10deg] drop-shadow-md pointer-events-none z-10"
                            >
                                {/* Pompom (White) - Hanging lower left */}
                                <circle cx="15" cy="55" r="10" fill="white" />

                                {/* Red Body - Draped over the curve */}
                                <path
                                    d="M20 50 Q 50 10 90 35 L 110 55 Q 60 40 20 60"
                                    fill="#D32F2F"
                                />

                                {/* Brim (Band) - Curved to fit the leaf head */}
                                <path
                                    d="M25 55 Q 60 30 115 55 L 115 68 Q 60 45 25 68 Z"
                                    fill="white"
                                />
                            </svg>
                        )}
                    </div>
                </a>

                {/* Desktop Nav */}
                <nav className="ml-auto hidden md:flex items-center gap-10 text-foreground-600">
                    <a
                        href="#caracteristicas"
                        className="relative hover:text-foreground transition-colors"
                    >
                        Características
                        <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-success transition-all group-hover:w-full" />
                    </a>
                    <a
                        href="#acerca"
                        className="relative hover:text-foreground transition-colors"
                    >
                        Acerca de
                    </a>
                </nav>

                <div className="hidden md:flex">
                    <Link
                        to="/login"
                        className="
              inline-flex items-center rounded-full
              bg-gradient-to-br from-emerald-600 to-green-600
              px-5 py-2 text-white text-sm font-medium
              shadow-sm hover:shadow-lg
              hover:from-emerald-700 hover:to-green-700
              transition-all
            "
                    >
                        Iniciar sesión
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="ml-auto md:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-default-100"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Abrir menú"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Sheet (animada) */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="mobile-menu"
                        className="md:hidden border-t border-default-200/70 bg-white"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1, transition: { duration: 0.25 } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                    >
                        <div className="px-5 py-4 flex flex-col gap-3">
                            <a
                                href="#caracteristicas"
                                className="py-2 text-foreground-700"
                                onClick={() => setOpen(false)}
                            >
                                Características
                            </a>
                            <a
                                href="#acerca"
                                className="py-2 text-foreground-700"
                                onClick={() => setOpen(false)}
                            >
                                Acerca de
                            </a>

                            <a
                                href="/login"
                                className="
                  mt-2 inline-flex items-center justify-center rounded-full
                  bg-emerald-600 px-5 py-2 text-white text-sm font-medium
                  shadow-sm hover:bg-emerald-700 transition-colors
                "
                                onClick={() => setOpen(false)}
                            >
                                Iniciar sesión
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
