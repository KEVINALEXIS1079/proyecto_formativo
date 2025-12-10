import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import Sidebar from "./components/Sidebar";
import ProtectedHeader from "./components/ProtectedHeader";
import { IoTApi } from "@/modules/iot/api/iot.api";
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
  leido?: boolean;
  read?: boolean;
  visto?: boolean;
  createdAt?: string;
};

export default function ProtectedLayout() {
  const [, setTitle] = useState("Inicio"); // title unused in layout now
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isLoading } = useProfile();
  const [alerts, setAlerts] = useState<RawAlert[]>([]);
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
      const data = await IoTApi.getAlerts();
      const list = normalizeAlerts(data);
      setAlerts(list.slice(0, 6));
    } catch (e) {
      console.error("Error cargando alertas IoT", e);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Carga inicial + polling ligero
  useEffect(() => {
    let mounted = true;
    fetchAlerts();
    const interval = window.setInterval(() => mounted && fetchAlerts(), 30000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  // Tiempo real por WebSocket
  useEffect(() => {
    const socket = connectSocket("/iot");
    const handleAlert = (alerta: RawAlert) => {
      setAlerts((prev) => {
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
      alerts.map((n, idx) => ({
        id: String(n.id ?? (n as any)._id ?? `alert-${idx}`),
        title: n.titulo || n.title || n.tipo || "Alerta IoT",
        body: n.mensaje || n.descripcion || n.detalle || "",
        unread: n.leido === false || n.read === false || n.visto === false,
        time: n.createdAt ? new Date(n.createdAt).toLocaleString("es-CO") : "",
      })),
    [alerts]
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
