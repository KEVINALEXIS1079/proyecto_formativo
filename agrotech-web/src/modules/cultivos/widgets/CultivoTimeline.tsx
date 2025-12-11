import { useMemo } from "react";
import { useActividades } from "@/modules/actividad/hooks/useActividades";
import { useCultivoHistorial } from "../hooks/useCultivos";
import { Card, CardBody, Chip, Spinner } from "@heroui/react";
import {
    Sprout,
    Droplets,
    Scissors,
    Bug,
    CheckCircle2,
    ClipboardList,
    History,
    AlertCircle
} from "lucide-react";

interface TimelineEvent {
    id: string;
    date: Date;
    type: "ACTIVITY" | "HISTORY";
    title: string;
    description?: string;
    status?: string;
    user?: string;
    icon?: any;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    metadata?: any;
}

const getActivityIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("riego")) return Droplets;
    if (t.includes("siembra")) return Sprout;
    if (t.includes("poda") || t.includes("mantenimiento")) return Scissors;
    if (t.includes("plaga") || t.includes("enfermedad")) return Bug;
    if (t.includes("cosecha")) return CheckCircle2;
    return ClipboardList;
};

const getActivityColor = (estado: string) => {
    if (estado === "PENDIENTE") return "warning";
    if (estado === "FINALIZADA") return "success";
    return "default";
};

export default function CultivoTimeline({ cultivoId }: { cultivoId: number }) {
    const { data: actividades = [], isLoading: loadingAct } = useActividades({ cultivoId });
    const { data: historial = [], isLoading: loadingHist } = useCultivoHistorial({ cultivoId });

    const events = useMemo(() => {
        const list: TimelineEvent[] = [];

        // Process Activities
        actividades.forEach((act: any) => {
            // Check if activity belongs to this crop (double check)
            const actCultivoId = act.cultivoId || act.cultivo?.id;
            if (Number(actCultivoId) !== Number(cultivoId)) return;

            list.push({
                id: `act-${act.id}`,
                date: new Date(act.fecha),
                type: "ACTIVITY",
                title: act.nombre,
                description: act.descripcion || act.tipo,
                status: act.estado,
                user: act.responsables?.[0]?.usuario?.nombre,
                icon: getActivityIcon(act.tipo || ""),
                color: getActivityColor(act.estado),
                metadata: act
            });
        });

        // Process History (Audits)
        historial.forEach((h: any) => {
            const isStatusChange = h.cambios && Object.keys(h.cambios).includes("estado");
            const title = isStatusChange ? "Cambio de Estado" : "Actualización de Datos";
            const icon = isStatusChange ? AlertCircle : History;

            let desc = h.motivo;
            if (isStatusChange) {
                const oldState = h.cambios.estado.previo;
                const newState = h.cambios.estado.nuevo;
                desc = `${oldState} → ${newState}. ${h.motivo}`;
            }

            list.push({
                id: `hist-${h.id}`,
                date: new Date(h.createdAt),
                type: "HISTORY",
                title: title,
                description: desc,
                user: h.usuario?.nombre || "Sistema",
                icon: icon,
                color: "primary", // History events are generic updates
                metadata: h
            });
        });

        // Process Creation (from History or inferred?)
        // Usually the first history entry is creation, or we can look at the crop data itself if passed.
        // For now rely on history.

        return list.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [actividades, historial, cultivoId]);

    if (loadingAct || loadingHist) {
        return <div className="flex justify-center p-8"><Spinner label="Cargando línea de tiempo..." color="success" /></div>;
    }

    if (events.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No hay eventos registrados para este cultivo.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent">
            {events.map((event) => {
                const Icon = event.icon;
                return (
                    <div key={event.id} className="relative">
                        <div className={`absolute -left-[42px] mt-1.5 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10
              ${event.type === 'ACTIVITY' ? (event.status === 'FINALIZADA' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600') : 'bg-blue-100 text-blue-600'}
            `}>
                            <Icon className="h-4 w-4" />
                        </div>

                        <Card shadow="sm" className="border border-gray-100/60 hover:border-gray-300 transition-colors">
                            <CardBody className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <h5 className="font-semibold text-gray-800 text-base">{event.title}</h5>
                                        {event.type === 'ACTIVITY' && (
                                            <Chip size="sm" variant="flat" color={event.color as any}>
                                                {event.status}
                                            </Chip>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {event.date.toLocaleDateString("es-CO", {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                                    {event.description}
                                </p>

                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                    <span className="text-xs text-gray-400">Registrado por:</span>
                                    <span className="text-xs font-medium text-gray-600">{event.user || "N/A"}</span>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
