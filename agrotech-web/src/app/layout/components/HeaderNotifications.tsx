import { Popover, PopoverTrigger, PopoverContent, Chip, Spinner, Badge, Button, ScrollShadow } from "@heroui/react";
import { Bell, Wheat, Package, AlertTriangle, AlertOctagon, Clock, CheckCircle2, UserPlus, Users, ListChecks } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body?: string;
  unread?: boolean;
  time?: string;
  source?: 'monitoreo' | 'inventario' | 'usuarios' | 'actividades';
  type?: string;
};

export default function HeaderNotifications({ items, loading }: { items: Notification[]; loading?: boolean }) {
  const unread = items.filter((n) => n.unread).length;

  const monitoreoItems = items.filter(n => n.source === 'monitoreo' || (!n.source && !n.id.startsWith('stock') && !n.id.startsWith('user') && !n.id.startsWith('act')));
  const inventarioItems = items.filter(n => n.source === 'inventario' || n.id.startsWith('stock'));
  const usuarioItems = items.filter(n => n.source === 'usuarios' || n.id.startsWith('user'));
  const actividadItems = items.filter(n => n.source === 'actividades' || n.id.startsWith('act'));

  const getIcon = (source: string | undefined, type: string | undefined) => {
    if (source === 'inventario') {
      return type === 'danger' ? <AlertOctagon size={18} /> : <AlertTriangle size={18} />;
    }
    if (source === 'usuarios') {
      return <UserPlus size={18} />;
    }
    if (source === 'actividades') {
      return <ListChecks size={18} />;
    }
    // IoT / Monitoreo
    return <AlertTriangle size={18} />;
  };

  const getColorClass = (type: string | undefined, source: string | undefined) => {
    if (source === 'inventario') {
      if (type === 'danger') return "bg-red-50 text-red-600 border-red-100";
      return "bg-orange-50 text-orange-600 border-orange-100";
    }
    if (source === 'usuarios') {
      return "bg-purple-50 text-purple-600 border-purple-100";
    }
    if (source === 'actividades') {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
    // IoT
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  const renderSection = (title: string, icon: React.ReactNode, list: Notification[], emptyMsg: string, headerColor: string) => (
    <div className="flex flex-col relative w-full">
      <div className={`px-4 py-3 flex items-center gap-2 sticky top-0 z-20 backdrop-blur-md bg-opacity-95 text-xs font-bold uppercase tracking-wider border-b border-default-100 shadow-sm ${headerColor}`}>
        {icon}
        {title}
        {list.length > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/60 px-1.5 font-mono text-[10px] text-foreground-500 shadow-sm border border-black/5">
            {list.length}
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="p-6 flex flex-col items-center justify-center text-center gap-2 opacity-60">
          <div className="p-2 bg-default-100 rounded-full">
            <CheckCircle2 size={16} className="text-default-400" />
          </div>
          <p className="text-[10px] text-default-500 font-medium uppercase tracking-tight">{emptyMsg}</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-default-100">
          {list.map((n) => (
            <li key={n.id} className="relative group p-4 hover:bg-default-50/50 transition-colors cursor-pointer">
              {n.unread && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <div className="flex gap-3">
                {/* Icon Box */}
                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm ${getColorClass(n.type, n.source)}`}>
                  {getIcon(n.source, n.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-tight ${n.unread ? "text-foreground-900" : "text-default-600"}`}>
                      {n.title}
                    </p>
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1" />}
                  </div>

                  {n.body && (
                    <p className="text-xs text-default-500 leading-relaxed line-clamp-2">
                      {n.body}
                    </p>
                  )}

                  {n.time && (
                    <div className="flex items-center gap-1 pt-1.5">
                      <Clock size={10} className="text-default-400" />
                      <span className="text-[10px] text-default-400 font-medium tracking-tight">
                        {n.time}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Popover placement="bottom-end" showArrow offset={10} classNames={{ content: "p-0 border-none shadow-xl rounded-xl" }}>
      <Badge content={unread > 0 ? unread : null} shape="circle" color="danger" size="sm" className="border-2 border-white shadow-sm" isInvisible={unread === 0}>
        <PopoverTrigger>
          <Button isIconOnly variant="light" radius="full" className="h-10 w-10 data-[hover=true]:bg-default-100" aria-label="Notificaciones">
            <Bell size={20} className="text-default-600" />
          </Button>
        </PopoverTrigger>
      </Badge>

      <PopoverContent className="w-[360px] sm:w-[380px] max-w-[95vw] bg-white text-foreground">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-default-100 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h4 className="text-sm font-bold text-foreground-900">Notificaciones</h4>
          </div>
          {unread > 0 && (
            <Chip size="sm" color="danger" variant="flat" classNames={{ content: "font-semibold text-xs px-2" }} className="h-6">
              {unread} nuevas
            </Chip>
          )}
        </div>

        {/* Content */}
        <ScrollShadow className="max-h-[480px] w-full bg-white relative">
          {loading ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-default-400">
              <Spinner size="md" color="current" />
              <p className="text-xs font-medium">Cargando...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 px-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-default-50 flex items-center justify-center">
                <Bell size={24} className="text-default-300" />
              </div>
              <p className="text-xs text-default-500">
                No tienes notificaciones pendientes.
              </p>
            </div>
          ) : (
            <div className="flex flex-col pb-2">
              {/* Sección Usuarios */}
              {renderSection(
                "Usuarios Pendientes",
                <Users size={14} className="text-purple-600" />,
                usuarioItems,
                "Sin usuarios por activar.",
                "bg-purple-50/90 text-purple-700"
              )}

              {/* Sección Actividades */}
              {renderSection(
                "Actividades Asignadas",
                <ListChecks size={14} className="text-emerald-600" />,
                actividadItems,
                "Sin nuevas asignaciones.",
                "bg-emerald-50/90 text-emerald-700"
              )}
              {renderSection(
                "Monitoreo",
                <Wheat size={14} className="text-blue-600" />,
                monitoreoItems,
                "Sin alertas de monitoreo.",
                "bg-blue-50/90 text-blue-700"
              )}

              {/* Sección Inventario */}
              {renderSection(
                "Inventario",
                <Package size={14} className="text-orange-600" />,
                inventarioItems,
                "Inventario al día.",
                "bg-orange-50/90 text-orange-700"
              )}
            </div>
          )}
        </ScrollShadow>

        {/* Footer */}
        <div className="p-2 border-t border-default-100 bg-gray-50 flex justify-center sticky bottom-0 z-30">
          <button className="text-[10px] font-semibold text-default-500 hover:text-primary transition-colors uppercase tracking-wide px-4 py-1">
            Ver todo el historial
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
