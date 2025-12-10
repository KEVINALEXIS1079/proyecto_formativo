import { motion } from "framer-motion";

export default function ActivityRow({ text, date, time }: { text: string; date: string; time: string }) {
    return (
        <motion.div
            className="flex items-center gap-3 rounded-lg border border-default-200 px-3 py-2 bg-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: ("easeOut" as any) }}
            whileHover={{ scale: 1.01 }}
        >
            <span className="h-2.5 w-2.5 rounded-full bg-success shrink-0" />
            <p className="flex-1 text-sm text-foreground-700 line-clamp-1">{text}</p>
            <div className="text-xs text-foreground-500 flex items-center gap-3 shrink-0">
                <span>{date}</span>
                <span>{time}</span>
            </div>
        </motion.div>
    );
}

export function ChipPill({ label }: { label: string }) {
    return <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{label}</span>;
}
