import { QueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

// Utility to batch invalidations
const debouncedInvalidate = (queryClient: QueryClient, key: string[], delay: number = 1000) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`🔄 Realtime: Debounced invalidation for [${key}]`);
    queryClient.invalidateQueries({ queryKey: key });
    debounceTimer = null;
  }, delay);
};

export function startUsuariosRealtime(queryClient: QueryClient) {
  if (socket && socket.connected) return;

  // Conectar al namespace /users
  socket = connectSocket("/users");

  socket.on("connect", () => {
    console.log("✅ WS Users connected");
  });

  socket.on("users:created", () => {
    console.log("⚡ WS Event: users:created");
    debouncedInvalidate(queryClient, ["users"]);
  });

  socket.on("users:updated", () => {
    console.log("⚡ WS Event: users:updated");
    debouncedInvalidate(queryClient, ["users"]);
  });

  socket.on("users:deleted", () => {
    console.log("⚡ WS Event: users:deleted");
    debouncedInvalidate(queryClient, ["users"]);
  });

  socket.on("users:role_updated", () => {
    console.log("⚡ WS Event: users:role_updated");
    debouncedInvalidate(queryClient, ["users"]);
  });
}
