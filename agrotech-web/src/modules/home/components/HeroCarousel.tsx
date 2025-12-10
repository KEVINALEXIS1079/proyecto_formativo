import { useState, useRef, useEffect } from "react";
import { Button, Card } from "@heroui/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export type Slide = { id: number | string; img?: string; title: string; subtitle?: string };

const fadeInUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: ({ duration: 0.35, ease: "easeOut" } as any) },
};

const floatHover = {
    rest: { y: 0, scale: 1 },
    hover: { y: -3, scale: 1.02, transition: ({ type: "spring", stiffness: 220, damping: 16 } as any) },
    tap: { scale: 0.98 },
};

export default function HeroCarousel({ slides, onNavigateCultivos }: { slides: Slide[]; onNavigateCultivos: () => void }) {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<number | null>(null);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (paused || slides.length === 0) return;
        timerRef.current = window.setInterval(() => {
            setIdx((i) => (i + 1) % slides.length);
        }, 4500);
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [paused, slides.length]);

    const go = (n: number) => setIdx((n + slides.length) % slides.length);
    const current = slides[idx] || slides[0];

    return (
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
            <Card shadow="sm" className="overflow-hidden rounded-2xl">
                <div
                    className="relative h-64 md:h-72"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div className="absolute inset-0">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={current?.id}
                                className="absolute inset-0"
                                initial={{ opacity: 0, x: reduceMotion ? 0 : 25 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: reduceMotion ? 0 : -25 }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                            >
                                <img
                                    src={current?.img || "/FondoLogin.jpeg"}
                                    alt={current?.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />

                                <motion.div
                                    className="absolute left-6 md:left-10 top-6 md:top-9 text-white space-y-1"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="show"
                                    transition={{ delay: 0.05 }}
                                >
                                    <p className="text-2xl md:text-3xl font-bold">{current?.title}</p>
                                    <p className="opacity-90 text-sm md:text-base">{current?.subtitle}</p>
                                </motion.div>

                                <motion.div
                                    className="absolute left-6 md:left-10 bottom-6"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="show"
                                    transition={{ delay: 0.15 }}
                                >
                                    <motion.div variants={floatHover} whileHover="hover" whileTap="tap" initial="rest" animate="rest">
                                        <Button
                                            variant="solid"
                                            radius="full"
                                            onPress={onNavigateCultivos}
                                            className="
                        bg-emerald-600 text-white h-9 px-5 text-sm font-medium
                        hover:bg-emerald-700 active:bg-emerald-800
                        opacity-100 data-[hover=true]:opacity-100 data-[pressed=true]:opacity-100
                      "
                                            endContent={<ChevronRight className="h-4 w-4" />}
                                        >
                                            Ver cultivos
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

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

                    <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-2 px-4">
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
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
