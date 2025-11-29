import { connectSocket } from "@/shared/api/client";
import type { QueryClient } from "@tanstack/react-query";

let started = false;

export function startUsuariosRealtime(qc: QueryClient) {
  if (started) return;
  started = true;

  const socket = connectSocket("/users");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["usuarios"] });

  ["create", "update", "remove", "restore", "created", "updated", "deleted"].forEach((ev) =>
    socket.on(ev, invalidate)
  );

  if (import.meta.env.DEV) {
    socket.onAny((event, ...args) => console.debug("[ws usuarios]", event, args?.[0]));
  }
}
