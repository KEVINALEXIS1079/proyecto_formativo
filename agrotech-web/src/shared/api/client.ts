// src/shared/api/client.ts
import axios, { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";
import { getToken, removeToken } from "../../modules/auth/api/cookies";

// =====================
// Axios centralizado
// =====================
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  withCredentials: true,
});

function extractApiMessage(data: any): string {
  if (!data) return "Error inesperado";
  const msg = Array.isArray(data?.message) ? data.message.join("\n") : data?.message;
  return msg || data?.error || data?.errors?.[0]?.msg || data?.detail || "Error inesperado";
}

api.interceptors.request.use((cfg) => {
  // Usamos cookies httpOnly para autenticación, no Authorization header
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    const status = err?.response?.status;

    if (status === 401 && location.pathname !== "/login") {
      removeToken();
      location.replace("/login");
      return Promise.reject(new Error("Sesión expirada"));
    }

    if (err.response) {
      const message = extractApiMessage(err.response.data);
      const apiError = new Error(message) as Error & { status?: number };
      apiError.status = status;
      return Promise.reject(apiError);
    }

    if (err.code === "ECONNABORTED") return Promise.reject(new Error("La solicitud tardó demasiado."));
    if (err.message === "Network Error") return Promise.reject(new Error("No hay conexión con el servidor."));
    return Promise.reject(new Error(err.message || "Error inesperado"));
  }
);

// =====================
// WebSocket centralizado
// Un socket por namespace (cache)
// =====================
const socketsByNs = new Map<string, Socket>();
const inactivityTimers = new Map<Socket, NodeJS.Timeout>();

function startInactivityTimer(socket: Socket) {
  clearInactivityTimer(socket);
  inactivityTimers.set(
    socket,
    setTimeout(() => {
      console.log("Desconectando socket por inactividad:", socket.id);
      socket.disconnect();
    }, 10 * 60 * 1000) // 10 minutos
  );
}

function clearInactivityTimer(socket: Socket) {
  const timer = inactivityTimers.get(socket);
  if (timer) {
    clearTimeout(timer);
    inactivityTimers.delete(socket);
  }
}

/**
 * Conecta al WebSocket con namespace opcional.
 * Ejemplo: const s = connectSocket("/usuarios");
 */
export function connectSocket(namespace = "/", token?: string): Socket {
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api/v1", "") ?? "http://localhost:4000";
  const url = `${baseUrl}${namespace}`;

  const existing = socketsByNs.get(url);
  if (existing) {
    if (!existing.connected) existing.connect();
    if (existing.connected) startInactivityTimer(existing);
    return existing;
  }

  const s = io(url, {
    transports: ["websocket"],
    withCredentials: true,
    auth: {}, // Usamos cookies para autenticación
    path: "/socket.io", // ajusta si usas otro path
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    forceNew: false,
    timeout: 5000,
  });

  s.on("connect", () => {
    console.log("✅ WS conectado:", namespace, s.id);
    startInactivityTimer(s);
  });
  s.on("disconnect", (r) => {
    console.warn("⚠️ WS desconectado:", namespace, r);
    clearInactivityTimer(s);
  });
  s.on("connect_error", (e) => console.error("❌ WS error:", namespace, e.message));
  s.onAny(() => startInactivityTimer(s));

  socketsByNs.set(url, s);
  return s;
}

export default api;
