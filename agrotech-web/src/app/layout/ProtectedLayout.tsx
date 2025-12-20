import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import MobileSidebar from "./components/MobileSidebar";
import Sidebar from "./components/Sidebar";
import ProtectedHeader from "./components/ProtectedHeader";
import { IoTApi } from "@/modules/iot/api/iot.api";
import { getStockAlerts } from "@/modules/inventario/api/insumos.service";
import { getUsers } from "@/modules/users/api/users.api";
import { UserStatus } from "@/modules/users/models/types/user.types";
import { connectSocket } from "@/shared/api/client";
import { useNotifications } from "@/hooks/useNotifications";

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
  const [, setTitle] = useState("Inicio");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isLoading } = useProfile();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [iotAlerts, setIotAlerts] = useState<RawAlert[]>([]);
  const [stockAlerts, setStockAlerts] = useState<RawAlert[]>([]);
  const [pendingUsers, setPendingUsers] = useState<RawAlert[]>([]);
  const [activityAlerts, setActivityAlerts] = useState<RawAlert[]>([]); // Deprecated? Kept for non-persisted real-time feedback if any
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const { notifications: dbNotifications, refetch: refetchNotifications, markAsRead } = useNotifications();

  // Refs for alert throttling - must be at component top level
  const pendingAlertsRef = useRef<RawAlert[]>([]);
  const alertRafIdRef = useRef<number | null>(null);
  const lastAlertFlushRef = useRef<number>(0);
  const MIN_ALERT_FLUSH_INTERVAL = 200; // 200ms for alerts

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

  // Maximum performance throttling for alerts - Ultra aggressive
  useEffect(() => {
    const socket = connectSocket("/iot");

    let pendingAlerts: RawAlert[] = [];
    let alertTimeout: NodeJS.Timeout | null = null;
    const MIN_ALERT_FLUSH_INTERVAL = 600; // 600ms ultra-aggressive
    const MAX_ALERTS_PER_BATCH = 10; // Reduced to 10

    const flushPendingAlerts = () => {
      if (pendingAlerts.length === 0) return;

      // Limit batch size - only keep most recent alerts
      const alerts = pendingAlerts.length > MAX_ALERTS_PER_BATCH
        ? pendingAlerts.slice(-MAX_ALERTS_PER_BATCH)
        : [...pendingAlerts];

      pendingAlerts = [];

      setIotAlerts((prev) => {
        const merged = [...alerts, ...prev];
        // Optimized duplicate removal using Set
        const seen = new Set<string>();
        const unique = merged.filter((item, idx) => {
          const id = String(item.id ?? (item as any)._id ?? idx);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return unique.slice(0, 6);
      });
    };

    const handleAlert = (alerta: RawAlert) => {
      pendingAlerts.push(alerta);

      // Ultra-aggressive throttle
      if (alertTimeout) clearTimeout(alertTimeout);
      alertTimeout = setTimeout(flushPendingAlerts, MIN_ALERT_FLUSH_INTERVAL);
    };

    socket.on("sensorAlert", handleAlert);
    socket.on("alertaIot", handleAlert);

    return () => {
      socket.off("sensorAlert", handleAlert);
      socket.off("alertaIot", handleAlert);

      // Flush remaining alerts
      if (alertTimeout) {
        clearTimeout(alertTimeout);
        flushPendingAlerts();
      }
    };
  }, []);

  // Activity Notifications
  useEffect(() => {
    if (!profile?.id) return;

    const socket = connectSocket("/");

    const handleNotification = (data: any) => {
      // Check if notification is for me
      if (data.targetUserId && Number(data.targetUserId) !== Number(profile.id)) return;

      // setActivityAlerts((prev) => [data, ...prev]);
      // Refetch from DB to get the persisted notification
      refetchNotifications();
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

      // Merge DB notifications (avoiding duplicates if logic overlaps, but DB usually wins for persistence)
      // Filter out activities from DB if we already showed them via socket? 
      // Actually, socket 'activityAlerts' was ephemeral in previous code. 
      // Now we prefer DB.
      // Let's use dbNotifications PRIMARILY. And mappedIoT/Stock as supplement.

      // Ensure types match
      const dbMapped = dbNotifications.map(n => ({
        ...n,
        source: n.source as any
      }));

      // Combine: DB items first (they have timestamps), then others
      return [...dbMapped, ...mappedUsers, ...mappedStock, ...mappedIoT];
    },
    [iotAlerts, stockAlerts, pendingUsers, activityAlerts, dbNotifications]
  );

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = useCallback(() => {
    setIsLogoutConfirmOpen(true);
  }, []);

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
    navigate("/start", { replace: true });
  };

  /* Handlers estables */
  const handleOpenMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const handleCloseMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <div className="min-h-dvh bg-white">
      <ProtectedHeader
        user={user}
        loading={isLoading}
        notifications={notifications}
        notificationsLoading={loadingAlerts}
        onLogout={handleLogoutClick}
        onMarkAsRead={markAsRead}
        onOpenMenu={handleOpenMenu}
      />

      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" onLogout={handleLogoutClick} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
        onLogout={handleLogoutClick}
      />

      <main className="relative p-4 md:p-6 pt-6 transition-[margin] duration-200 md:ml-16 peer-hover:ml-64">
        <Outlet context={{ setTitle } satisfies LayoutContext} />
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        size="sm"
        placement="center"
        backdrop="blur"
        className="z-[9999] mx-4" // mx-4 ensures some margin on very narrow screens
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flexflex-col gap-1">Cerrar Sesión</ModalHeader>
              <ModalBody>
                <p>¿Estás seguro de que deseas salir?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button className="bg-emerald-500 text-black hover:bg-emerald-400" onPress={handleConfirmLogout}>
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
