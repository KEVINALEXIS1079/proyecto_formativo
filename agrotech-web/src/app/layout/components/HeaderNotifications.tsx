
import { Popover, PopoverTrigger, PopoverContent, Chip, Divider, Spinner } from "@heroui/react";
import { Bell } from "lucide-react";
import { IconBadgeButton } from "./IconBadgeButton";

type Notification = { id: string; title: string; body?: string; unread?: boolean; time?: string };

export default function HeaderNotifications({ items, loading }: { items: Notification[]; loading?: boolean }) {
  const unread = items.filter((n) => n.unread).length;

  return (
    <Popover placement="bottom-end" showArrow offset={8}>
      <PopoverTrigger>
        <IconBadgeButton count={unread} icon={<Bell className="h-5 w-5" />} ariaLabel="Notificaciones" />
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[320px]">
        <div className="p-3 flex items-center justify-between">
          <h4 className="text-base font-semibold">Notificaciones</h4>
          <Chip size="sm" variant="flat" color="primary">
            {unread} sin leer
          </Chip>
        </div>
        <Divider />
        <div className="max-h-[260px] overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-sm text-default-500">
              <Spinner size="sm" /> Cargando alertas...
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-sm text-default-500">No tienes notificaciones.</div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n.id} className="p-3 hover:bg-default-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full mt-1 ${n.unread ? "bg-primary" : "bg-default-300"}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground-900">{n.title}</p>
                        <span className="text-[11px] text-default-500">{n.time}</span>
                      </div>
                      {n.body && <p className="text-xs text-default-600 leading-relaxed">{n.body}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
