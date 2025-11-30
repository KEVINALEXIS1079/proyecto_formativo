import { QueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export function startUsuariosRealtime(queryClient: QueryClient) {
  if (socket && socket.connected) return;

  // Conectar al namespace /users
  socket = connectSocket("/users");

  socket.on("connect", () => {
    console.log("✅ WS Users connected");
  });

  socket.on("users:created", () => {
    console.log("🔄 Realtime: users:created -> invalidating query");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  });

  socket.on("users:updated", () => {
    console.log("🔄 Realtime: users:updated -> invalidating query");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  });

  socket.on("users:deleted", () => {
    console.log("🔄 Realtime: users:deleted -> invalidating query");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  });
  
  socket.on("users:role_updated", () => {
    console.log("🔄 Realtime: users:role_updated -> invalidating query");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  });
}
