import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { geoService } from "../api/geo.service";
import { connectSocket } from "@/shared/api/client";

export function useGeoData(filters?: { estado?: string }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket("/geo");

    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["geo", "lotes"] });
    };

    socket.on("lotes:updated", handleInvalidate);
    socket.on("lotes:removed", handleInvalidate);
    socket.on("sublotes:created", handleInvalidate);
    socket.on("sublotes:updated", handleInvalidate);
    socket.on("sublotes:removed", handleInvalidate);

    // Also listen for creation if backend emits it
    socket.on("lotes:created", handleInvalidate);

    return () => {
      socket.off("lotes:updated", handleInvalidate);
      socket.off("lotes:removed", handleInvalidate);
      socket.off("sublotes:created", handleInvalidate);
      socket.off("sublotes:updated", handleInvalidate);
      socket.off("sublotes:removed", handleInvalidate);
      socket.off("lotes:created", handleInvalidate);
      socket.disconnect();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["geo", "lotes", filters],
    queryFn: () => geoService.getLotes(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
