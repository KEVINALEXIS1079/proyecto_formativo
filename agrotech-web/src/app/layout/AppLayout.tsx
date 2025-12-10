
import { Outlet, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  User as UserCard,
  Divider,
  Spinner,
} from "@heroui/react";
import { Bell, LogOut, UserRound, Mail } from "lucide-react";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { usePerfil } from "../../modules/usuarios/perfil/hooks/usePerfil";
import { useEffect, useMemo, useState } from "react";
import { IoTApi } from "@/modules/iot/api/iot.api";
import { connectSocket } from "@/shared/api/client";

export default function AppLayout() {
  const navigate = useNavigate();
  const { me, loading } = usePerfil();
  const { logout } = useAuth();

  const user = me ? {
    name: `${me.nombre} ${me.apellido}`,
    email: me.correo,
    role: me.rol?.nombre ?? "Sin rol",
    avatarUrl: me.avatar ?? "",
  } : null;

  type RawAlert = {
    id?: string | number;
    _id?: string | number;
    titulo?: string;
    title?: string;
    tipo?: string;
    mensaje?: string;
    descripcion?: string;
    detalle?: string;
    leido?: boolean;
    read?: boolean;
    visto?: boolean;
    createdAt?: string;
  };

  const [iotAlerts, setIotAlerts] = useState<RawAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const normalizeAlerts = (data: any): RawAlert[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.alerts)) return data.alerts;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const data = await IoTApi.getAlerts();
      const list = normalizeAlerts(data);
      setIotAlerts(list.slice(0, 6));
    } catch (error) {
      console.error("Error cargando alertas IoT", error);
      setIotAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchAlerts();
    const interval = window.setInterval(() => mounted && fetchAlerts(), 30000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const socket = connectSocket("/iot");
    const handleAlert = (alerta: RawAlert) => {
      setIotAlerts((prev) => {
        const merged = [alerta, ...prev];
        const unique = merged.filter(
          (item, idx) =>
            merged.findIndex(
              (o) => String(o.id ?? (o as any)._id ?? idx) === String(item.id ?? (item as any)._id ?? idx)
            ) === idx
        );
        return unique.slice(0, 6);
      });
    };
    socket.on("sensorAlert", handleAlert);
    socket.on("alertaIot", handleAlert);
    return () => {
      socket.off("sensorAlert", handleAlert);
      socket.off("alertaIot", handleAlert);
    };
  }, []);

  const notifications = useMemo(
    () =>
      iotAlerts.map((n, idx) => ({
        id: String(n.id ?? (n as any)._id ?? `alert-${idx}`),
        title: (n.titulo || n.title || n.tipo || n.nivel || n.severidad || "Alerta IoT") as string,
        body: n.mensaje || n.descripcion || n.detalle || n.body || "",
        unread:
          n.leido === false ||
          n.read === false ||
          n.visto === false ||
          (n.leido === undefined && n.read === undefined && n.visto === undefined),
        time: n.createdAt
          ? new Date(n.createdAt).toLocaleString("es-CO")
          : (n as any).fecha
          ? new Date((n as any).fecha).toLocaleString("es-CO")
          : "",
      })),
    [iotAlerts]
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = async () => {
    await logout();
    navigate("/start", { replace: true });
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto w-full p-3 flex items-center gap-3">
          {/* Logo / título */}
          <div className="font-semibold mr-auto">AgroTech</div>

          {/* Notificaciones */}
          <Popover placement="bottom-end" showArrow offset={8}>
            <PopoverTrigger>
              <Badge
                content={unreadCount || null}
                shape="circle"
                color="danger"
                isInvisible={!unreadCount}
              >
                <Button isIconOnly variant="light" aria-label="Notificaciones">
                  <Bell className="h-5 w-5" />
                </Button>
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]">
              <div className="p-3 flex items-center justify-between">
                <h4 className="text-base font-semibold">Notificaciones IoT</h4>
                <Chip size="sm" variant="flat" color="primary">
                  {unreadCount} sin leer
                </Chip>
              </div>
              <Divider />
              <div className="max-h-[240px] overflow-y-auto">
                {loadingAlerts ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-sm text-default-500">
                    <Spinner size="sm" /> Cargando alertas...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-default-500">
                    No tienes notificaciones.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {notifications.map((n) => (
                      <li key={n.id} className="p-3 hover:bg-default-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <span className={`h-2.5 w-2.5 rounded-full mt-1 ${n.unread ? "bg-primary" : "bg-default-300"}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold uppercase text-foreground-900">{n.title}</p>
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
              <Divider />
              <div className="p-3">
                <Button fullWidth color="success" variant="flat" onPress={() => navigate("/iot")}>
                  Ir a IoT
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Perfil */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant="light"
                className="px-2"
                startContent={
                  <Avatar
                    size="sm"
                    src={user?.avatarUrl}
                    name={user?.name ?? "U"}
                    className="ring-1 ring-default-200"
                  />
                }
              >
                <span className="hidden sm:inline text-sm">
                  {loading ? "Cargando..." : user?.name ?? "Usuario"}
                </span>
              </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Menú de usuario" className="w-[260px]">
              <DropdownItem key="profile" isReadOnly className="h-auto cursor-default">
                <UserCard
                  name={loading ? "Cargando..." : user?.name ?? "Usuario"}
                  description={
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3" />
                      {loading ? "Cargando..." : user?.email ?? "sin-correo@example.com"}
                    </span>
                  }
                  avatarProps={{ src: user?.avatarUrl, name: user?.name ?? "U" }}
                />
                <Chip size="sm" variant="flat" className="mt-2">
                  {loading ? "Cargando..." : user?.role ?? "Invitado"}
                </Chip>
              </DropdownItem>

              <DropdownItem key="profile-btn" startContent={<UserRound className="h-4 w-4" />}>
                Mi perfil
              </DropdownItem>

              <DropdownItem
                key="logout"
                className="text-danger"
                color="danger"
                startContent={<LogOut className="h-4 w-4" />}
                onPress={handleLogout}
              >
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto w-full p-6">
        <Outlet />
      </main>
    </div>
  );
}
