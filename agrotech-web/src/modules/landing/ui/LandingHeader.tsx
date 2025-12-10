import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const fadeDown = {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0, transition: ({ duration: 0.45, ease: "easeOut" } as any) },
};

export default function LandingHeader() {
    const [open, setOpen] = useState(false);

    return (
        <motion.header
            className="sticky top-0 z-40 border-b border-default-200/70 bg-white/80 backdrop-blur-md"
            variants={fadeDown}
            initial="initial"
            animate="animate"
        >
            <div className="mx-auto max-w-7xl h-16 px-5 flex items-center gap-4">
                <a href="/" className="flex items-center gap-2">
                    <img
                        src="/LogoTic.png"
                        alt="TIC"
                        className="h-10 md:h-12 w-auto object-contain"
                    />
                    <span className="hidden sm:inline text-base font-semibold tracking-tight">
                        AgroTech
                    </span>
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
