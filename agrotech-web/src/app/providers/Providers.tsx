import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { startUsuariosRealtime } from "@/modules/users/models/realtime";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

export default function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    // WebSocket (si el server emite)
    startUsuariosRealtime(queryClient);

    // Fallback cross-tab instantáneo
    const ch = new BroadcastChannel("usuarios");
    ch.onmessage = (ev) => {
      if (ev?.data === "invalidate-usuarios") {
        queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      }
    };
    return () => ch.close();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
}
