
export default function SensorCard({
    name,
    valor,
    unidad,
    fecha,
    estado,
}: {
    name: string;
    valor?: any;
    unidad?: string;
    fecha?: string;
    estado?: string;
}) {
    const parsedDate = fecha ? new Date(fecha) : null;
    const isStale = !parsedDate || isNaN(parsedDate.getTime()) || Date.now() - parsedDate.getTime() > 10_000;
    const effectiveEstado = isStale ? "DESCONECTADO" : estado;
    const fechaStr = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "Sin lecturas";
    const color =
        effectiveEstado === "CONECTADO"
            ? "text-emerald-600 bg-emerald-50"
            : effectiveEstado === "ERROR"
                ? "text-amber-600 bg-amber-50"
                : "text-gray-500 bg-gray-100";

    const normalizeValue = (v: any): { value: string; unit?: string } => {
        if (effectiveEstado !== "CONECTADO") return { value: "-", unit: unidad };
        if (v === null || v === undefined) return { value: "-", unit: unidad };
        let parsed: any = v;
        if (typeof v === "string") {
            try {
                parsed = JSON.parse(v);
            } catch {
                const num = Number(v);
                return { value: isNaN(num) ? v : num.toFixed(1), unit: unidad };
            }
        }
        if (Array.isArray(parsed)) {
            const first = parsed.find((x) => x !== null && x !== undefined) ?? parsed[0];
            if (first === undefined) return { value: "-", unit: unidad };
            parsed = first;
        }
        if (typeof parsed === "object") {
            const val = parsed.valor ?? parsed.value ?? parsed.reading ?? parsed.ultimoValor ?? parsed.data ?? null;
            const unitObj = parsed.unidad ?? parsed.unit ?? unidad;
            if (val === null || val === undefined) return { value: "-", unit: unitObj };
            const num = Number(val);
            return { value: isNaN(num) ? String(val) : num.toFixed(1), unit: unitObj };
        }
        const num = Number(parsed);
        return { value: isNaN(num) ? String(parsed) : num.toFixed(1), unit: unidad };
    };

    const { value: displayValue, unit: displayUnit } = isStale ? { value: "-", unit: unidad } : normalizeValue(valor);

    return (
        <div className="h-full rounded-xl border border-default-200 p-3 flex flex-col gap-2 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground-800 line-clamp-1 max-w-[70%]">{name}</p>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${color}`}>{effectiveEstado || "SIN ESTADO"}</span>
            </div>
            <div className="flex items-end gap-1">
                <p className="text-xl font-bold text-foreground-900">{displayValue}</p>
                <span className="text-sm text-foreground-500 mb-1">{displayUnit || ""}</span>
            </div>
            <p className="text-xs text-foreground-500 line-clamp-1">Última lectura: {fechaStr}</p>
        </div>
    );
}
