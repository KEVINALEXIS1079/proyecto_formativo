import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from '@heroui/react';
import { CheckCheck, AlertTriangle, AlertOctagon, UserPlus, ListChecks, CheckCircle2, ArrowLeft } from 'lucide-react';
import { isToday, isYesterday, isThisWeek } from 'date-fns';
import Surface from '../../users/ui/Surface';
import { useNotifications, type Notification } from '../../../hooks/useNotifications';
import NotificationsPillToggle from '../ui/NotificationsPillToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { notifications, loading, markAsRead, markAllAsRead, handleNotificationClick } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('unread');

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return n.unread;
        return true;
    });

    const getIcon = (source: string | undefined, type: string | undefined) => {
        if (source === 'inventario') return type === 'danger' ? <AlertOctagon size={20} /> : <AlertTriangle size={20} />;
        if (source === 'usuarios') return <UserPlus size={20} />;
        if (source === 'actividades') return <ListChecks size={20} />;
        return <AlertTriangle size={20} />;
    };

    const getColorClass = (type: string | undefined, source: string | undefined) => {
        if (source === 'inventario') return type === 'danger' ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100";
        if (source === 'usuarios') return "bg-purple-50 text-purple-600 border-purple-100";
        if (source === 'actividades') return "bg-emerald-50 text-emerald-600 border-emerald-100";
        return "bg-blue-50 text-blue-600 border-blue-100";
    };

    return (
        <div className="mx-auto max-w-7xl space-y-5">
            {/* Header matching InventarioPage */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        size="sm"
                        onPress={() => navigate(-1)}
                        className="-ml-2"
                    >
                        <ArrowLeft size={18} className="text-default-500" />
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground-900">Notificaciones</h1>
                </div>
                <p className="text-sm opacity-70">Historial completo de alertas, asignaciones y novedades del sistema</p>
            </div>

            {/* PillToggle y botón de acción en la misma fila */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <NotificationsPillToggle value={filter} onChange={setFilter} />

                {filtered.some(n => n.unread) && (
                    <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="font-medium"
                        startContent={<CheckCheck size={16} />}
                        onClick={markAllAsRead}
                    >
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            <Surface className="min-h-[400px] p-0 overflow-hidden">
                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={filter}
                            initial={{ x: -24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 24, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 24 }}
                        >
                            {loading ? (
                                <div className="h-96 flex flex-col items-center justify-center gap-4 text-default-400">
                                    <Spinner size="lg" color="current" />
                                    <p className="text-sm">Cargando notificaciones...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="h-96 flex flex-col items-center justify-center gap-4 text-default-400">
                                    <div className="w-20 h-20 rounded-full bg-default-100/50 flex items-center justify-center p-6 mb-2">
                                        <CheckCircle2 size="100%" strokeWidth={1.5} className="opacity-50" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-medium text-foreground-700">Estas al día</p>
                                        <p className="text-sm text-default-500 mt-1">No hay notificaciones {filter === 'unread' ? 'pendientes' : 'para mostrar'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Standard Date Grouping logic inline for simplicity/performance in render */}
                                    {(() => {
                                        const sections: { title: string; items: Notification[] }[] = [
                                            { title: 'Hoy', items: [] },
                                            { title: 'Ayer', items: [] },
                                            { title: 'Esta semana', items: [] },
                                            { title: 'Anteriores', items: [] }
                                        ];

                                        filtered.forEach(n => {
                                            const date = n.createdAt || new Date();
                                            if (isToday(date)) {
                                                sections[0].items.push(n);
                                            } else if (isYesterday(date)) {
                                                sections[1].items.push(n);
                                            } else if (isThisWeek(date)) {
                                                sections[2].items.push(n);
                                            } else {
                                                sections[3].items.push(n);
                                            }
                                        });

                                        return (
                                            <>
                                                {sections.map(section => (
                                                    section.items.length > 0 && (
                                                        <div key={section.title} className="space-y-4">
                                                            <div className="sticky top-[72px] z-10">
                                                                <div className="inline-block px-3 py-1 bg-default-100/80 backdrop-blur-md rounded-full border border-default-200 shadow-sm">
                                                                    <span className="text-xs font-bold text-default-600 uppercase tracking-wider">
                                                                        {section.title}
                                                                        <span className="ml-1.5 text-default-400 font-normal">
                                                                            {section.items.length}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col space-y-3">
                                                                {section.items.map(n => (
                                                                    <div
                                                                        key={n.id}
                                                                        className={`group relative p-4 md:p-5 border rounded-2xl transition-all duration-200 cursor-pointer flex gap-4 overflow-hidden
                                                                            ${n.unread
                                                                                ? 'bg-white border-default-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:border-primary-200'
                                                                                : 'bg-default-50/50 border-default-100 opacity-70 hover:opacity-100 hover:bg-white hover:border-default-200'}`}
                                                                        onClick={() => handleNotificationClick(n)}
                                                                    >
                                                                        {n.unread && (
                                                                            <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full" />
                                                                        )}

                                                                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${getColorClass(n.type, n.source)}`}>
                                                                            {getIcon(n.source, n.type)}
                                                                        </div>

                                                                        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1.5">
                                                                                <div className="flex items-center gap-2 pr-2">
                                                                                    <h3 className={`text-base font-semibold leading-tight tracking-tight ${n.unread ? 'text-foreground-900' : 'text-default-600'}`}>
                                                                                        {n.title}
                                                                                    </h3>
                                                                                    {n.unread && (
                                                                                        <span className="relative flex h-2 w-2">
                                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-[11px] font-medium text-default-400 bg-white/50 px-2 py-0.5 rounded-md self-start md:self-auto border border-transparent group-hover:border-default-200 transition-colors">
                                                                                    {n.time}
                                                                                </span>
                                                                            </div>

                                                                            <p className="text-sm text-default-500 leading-relaxed max-w-[90%]">
                                                                                {n.body}
                                                                            </p>
                                                                        </div>

                                                                        <div className="hidden md:flex flex-col justify-center pl-2 border-l border-transparent group-hover:border-default-100 transition-colors">
                                                                            <div className="p-2 rounded-full text-default-300 group-hover:text-primary group-hover:bg-primary-50 transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
                                                                                <ArrowLeft size={18} className="rotate-180" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </>
                                        );
                                    })()}


                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Surface>
        </div>
    );
}
