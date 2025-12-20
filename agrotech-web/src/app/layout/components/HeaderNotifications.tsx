import { Popover, PopoverTrigger, PopoverContent, Chip, Spinner, Badge, Button, ScrollShadow } from "@heroui/react";
import { Bell, AlertTriangle, AlertOctagon, UserPlus, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Notification = {
  id: string;
  title: string;
  body?: string;
  unread?: boolean;
  time?: string;
  source?: 'monitoreo' | 'inventario' | 'usuarios' | 'actividades';
  type?: string;
  metadata?: any;
};

export default function HeaderNotifications({ items, loading, onMarkAsRead, onNotificationClick }: { items: Notification[]; loading?: boolean; onMarkAsRead?: (id: string) => void; onNotificationClick?: (n: Notification) => void }) {
  const navigate = useNavigate();
  const unread = items.filter((n) => n.unread).length;

  const monitoreoItems = items.filter(n => n.source === 'monitoreo' || (!n.source && !n.id.startsWith('stock') && !n.id.startsWith('user') && !n.id.startsWith('act')));
  const inventarioItems = items.filter(n => n.source === 'inventario' || n.id.startsWith('stock'));
  const usuarioItems = items.filter(n => n.source === 'usuarios' || n.id.startsWith('user'));
  const actividadItems = items.filter(n => n.source === 'actividades' || n.id.startsWith('act'));

  const getIcon = (source: string | undefined, type: string | undefined) => {
    if (source === 'inventario') return type === 'danger' ? <AlertOctagon size={16} /> : <AlertTriangle size={16} />;
    if (source === 'usuarios') return <UserPlus size={16} />;
    if (source === 'actividades') return <ListChecks size={16} />;
    return <AlertTriangle size={16} />;
  };

  const getColorClass = (type: string | undefined, source: string | undefined) => {
    if (source === 'inventario') return type === 'danger' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600";
    if (source === 'usuarios') return "bg-purple-50 text-purple-600";
    if (source === 'actividades') return "bg-emerald-50 text-emerald-600";
    return "bg-blue-50 text-blue-600";
  };

  const renderSection = (title: string, list: Notification[]) => (
    <div className="flex flex-col w-full">
      <div className="px-4 py-2 text-[10px] font-bold text-default-400 uppercase tracking-wider bg-default-50 border-y border-default-100 sticky top-0 z-10 backdrop-blur-sm bg-default-50/80">
        {title} <span className="ml-1 text-default-300">({list.length})</span>
      </div>
      <ul className="flex flex-col divide-y divide-default-50">
        {list.map((n) => (
          <li
            key={n.id}
            className={`relative group px-4 py-3 hover:bg-default-100 transition-all cursor-pointer ${n.unread ? "bg-white" : "bg-default-50/20 opacity-75"}`}
            onClick={() => onNotificationClick ? onNotificationClick(n) : onMarkAsRead?.(n.id)}
          >
            {n.unread && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-md" />
            )}
            <div className="flex gap-3">
              <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getColorClass(n.type, n.source)}`}>
                {getIcon(n.source, n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium leading-tight ${n.unread ? "text-foreground-900" : "text-default-600"}`}>
                    {n.title}
                  </p>
                  {n.time && <span className="text-[10px] text-default-400 shrink-0 font-medium">{n.time}</span>}
                </div>
                {n.body && (
                  <p className="text-xs text-default-500 leading-relaxed line-clamp-2">
                    {n.body}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const hasItems = items.length > 0;

  return (
    <Popover placement="bottom-end" showArrow offset={10} classNames={{ content: "p-0 border-0 shadow-lg ring-1 ring-black/5 rounded-medium w-[90vw] sm:w-[360px]" }}>
      <Badge content={unread > 0 ? unread : null} shape="circle" color="danger" size="sm" className="border-2 border-white shadow-sm" isInvisible={unread === 0}>
        <PopoverTrigger>
          <Button isIconOnly variant="light" radius="full" className="h-10 w-10 data-[hover=true]:bg-default-100" aria-label="Notificaciones">
            <Bell size={20} className="text-default-600" />
          </Button>
        </PopoverTrigger>
      </Badge>

      <PopoverContent className="w-[90vw] sm:w-[360px] bg-white text-foreground overflow-hidden flex flex-col">
        {/* Static Header */}
        <div className="px-4 py-3 bg-white border-b border-default-100 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground-900">Notificaciones</h4>
            {unread > 0 ? (
              <Chip size="sm" color="danger" variant="flat" className="h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider">
                {unread} nuevas
              </Chip>
            ) : null}
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollShadow className="flex-1 w-full bg-white relative max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-default-400">
              <Spinner size="md" color="current" />
            </div>
          ) : !hasItems ? (
            <div className="py-12 px-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-default-50 flex items-center justify-center ring-4 ring-default-50/50">
                <Bell size={24} className="text-default-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground-700">Estas al día</p>
                <p className="text-xs text-default-400 mt-1 max-w-[200px] mx-auto">
                  No tienes notificaciones pendientes.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-2">
              {usuarioItems.length > 0 && renderSection("Usuarios", usuarioItems)}
              {actividadItems.length > 0 && renderSection("Actividades", actividadItems)}
              {monitoreoItems.length > 0 && renderSection("Monitoreo", monitoreoItems)}
              {inventarioItems.length > 0 && renderSection("Inventario", inventarioItems)}
            </div>
          )}
        </ScrollShadow>

        {/* Static Footer */}
        <div className="p-2 border-t border-default-100 bg-gray-50/50 shrink-0 z-20">
          <Button
            size="sm"
            variant="light"
            className="text-xs font-semibold text-primary uppercase tracking-wide w-full"
            onPress={() => navigate('/notificaciones')}
          >
            Ver historial completo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
