import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import Sidebar from "./components/Sidebar";
import ProtectedHeader from "./components/ProtectedHeader";
import { IoTApi } from "@/modules/iot/api/iot.api";
import { getStockAlerts } from "@/modules/inventario/api/insumos.service";
import { getUsers } from "@/modules/users/api/users.api";
import { UserStatus } from "@/modules/users/models/types/user.types";
import { connectSocket } from "@/shared/api/client";

export type LayoutContext = { setTitle: (t: string) => void };

type RawAlert = {
  id?: string | number;
  _id?: string | number;
  titulo?: string;
  title?: string;
  tipo?: string;
  mensaje?: string;
  descripcion?: string;
  detalle?: string;
  body?: string;
  leido?: boolean;
  read?: boolean;
  visto?: boolean;
  createdAt?: string;
  // Inventory specific
  nombre?: string;
  stockUso?: number;
  unidadUso?: string;
  stockMinimo?: number;
  almacen?: { nombre: string };
  estado?: string; // Also user status
  // User specific
  apellido?: string;
  identificacion?: string;
  correo?: string;
};

export default function ProtectedLayout() {
  const [, setTitle] = useState("Inicio"); // title unused in layout now
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isLoading } = useProfile();

  const [iotAlerts, setIotAlerts] = useState<RawAlert[]>([]);
  const [stockAlerts, setStockAlerts] = useState<RawAlert[]>([]);
  const [pendingUsers, setPendingUsers] = useState<RawAlert[]>([]);
  const [activityAlerts, setActivityAlerts] = useState<RawAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const user = profile
    ? {
      name: `${profile.nombre} ${profile.apellido}`,
      email: profile.correo,
      role: profile.rol?.nombre ?? "Sin rol",
      avatarUrl: profile.avatarUrl
        ? profile.avatarUrl.startsWith("http")
          ? profile.avatarUrl
          : `http://localhost:4000${profile.avatarUrl.startsWith("/") ? "" : "/"}${profile.avatarUrl}`
        : undefined,
    }
    : null;

  const normalizeAlerts = (data: any): RawAlert[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.alerts)) return data.alerts;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const [iotData, stockData, usersData] = await Promise.all([
        IoTApi.getAlerts().catch(e => {
          console.error("Error cargando alertas IoT", e);
          return [];
        }),
        getStockAlerts().catch(e => {
          console.error("Error cargando alertas Stock", e);
          return [];
        }),
        getUsers({ estado: UserStatus.INACTIVO }).catch(e => {
          console.error("Error cargando usuarios pendientes", e);
          return [];
        })
      ]);

      const listIoT = normalizeAlerts(iotData);
      setIotAlerts(listIoT.slice(0, 6));

      const listStock = normalizeAlerts(stockData);
      setStockAlerts(listStock);

      const listUsers = normalizeAlerts(usersData);
      setPendingUsers(listUsers);

    } catch (e) {
      console.error("Error general cargando alertas", e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Carga inicial + polling ligero
  useEffect(() => {
    let mounted = true;
    fetchAlerts();
    const interval = window.setInterval(() => mounted && fetchAlerts(), 60000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  // Tiempo real por WebSocket (solo IoT por ahora)
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

  // Activity Notifications
  useEffect(() => {
    if (!profile?.id) return;

    const socket = connectSocket("/");

    const handleNotification = (data: any) => {
      // Check if notification is for me
      if (data.targetUserId && Number(data.targetUserId) !== Number(profile.id)) return;

      setActivityAlerts((prev) => [data, ...prev]);
    };

    socket.on("activityNotification", handleNotification);

    return () => {
      socket.off("activityNotification", handleNotification);
    };
  }, [profile?.id]);

  const notifications = useMemo(
    () => {
      const mappedIoT = iotAlerts.map((n, idx) => ({
        id: String(n.id ?? (n as any)._id ?? `iot-${idx}`),
        title: n.titulo || n.title || n.tipo || "Alerta IoT",
        body: n.mensaje || n.descripcion || n.detalle || "",
        unread: n.leido === false || n.read === false || n.visto === false,
        time: n.createdAt ? new Date(n.createdAt).toLocaleString("es-CO") : "",
        source: 'monitoreo' as const,
        type: 'error' // Default for IoT
      }));

      const mappedStock = stockAlerts.map((n, idx) => ({
        id: String(n.id ?? `stock-${idx}`),
        title: n.nombre || "Alerta de Stock",
        body: `Stock: ${n.stockUso} ${n.unidadUso} (Mín: ${n.stockMinimo}) - ${n.almacen?.nombre || 'Sin almacén'}`,
        unread: true, // Stock alerts appear until resolved
        time: "",
        source: 'inventario' as const,
        type: n.estado === 'AGOTADO' ? 'danger' : 'warning'
      }));

      const mappedUsers = pendingUsers.map((n, idx) => ({
        id: String(n.id ?? `user-${idx}`),
        title: "Usuario Pendiente",
        body: `${n.nombre} ${n.apellido} - ${n.correo}. Requiere activación.`,
        unread: true,
        // Users might not have 'createdAt' directly if mapped from raw, or checking types
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString("es-CO") : "Pendiente",
        source: 'usuarios' as const,
        type: 'info'
      }));

      const mappedActivities = activityAlerts.map((n, idx) => ({
        id: String(n.id ?? `act-${idx}`),
        title: n.title || "Actividad",
        body: n.body || n.mensaje || "",
        unread: true,
        time: new Date().toLocaleTimeString("es-CO"), // Real-time
        source: 'actividades' as const,
        type: n.tipo || 'info'
      }));

      return [...mappedActivities, ...mappedUsers, ...mappedStock, ...mappedIoT];
    },
    [iotAlerts, stockAlerts, pendingUsers]
  );

  const handleLogout = async () => {
    await logout();
    navigate("/start", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-white">
      <ProtectedHeader
        user={user}
        loading={isLoading}
        notifications={notifications}
        notificationsLoading={loadingAlerts}
        onLogout={handleLogout}
      />

      <Sidebar onLogout={handleLogout} />

      <main className="relative p-4 md:p-6 pt-16 transition-[margin] duration-200 ml-16 peer-hover:ml-64">
        <Outlet context={{ setTitle } satisfies LayoutContext} />
      </main>
    </div>
  );
}

