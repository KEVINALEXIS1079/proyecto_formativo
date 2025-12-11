import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
    message: string | null;
    onClose: () => void;
    duration?: number;
}

export default function MapValidationAlert({ message, onClose, duration = 5000 }: Props) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-sm w-full px-4"
                >
                    <div className="bg-red-500 text-white rounded-lg shadow-xl p-3 flex items-start gap-3 border border-red-600">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm font-medium">
                            {message}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-0.5 rounded-full hover:bg-red-600/50"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
