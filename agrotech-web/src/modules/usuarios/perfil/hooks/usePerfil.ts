// src/modules/perfil/hooks/usePerfil.ts
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPerfil, savePerfil, perfilService } from "../api/perfil.service";
import type { Perfil, UpdatePerfilInput } from "../model/types";

const qk = { me: () => ["perfil", "me"] as const };

export function usePerfil() {
  const qc = useQueryClient();
  const wsBound = useRef(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const lastUrl = useRef<string | null>(null);

  // Consulta perfil
  const { data: me, isFetching: loading } = useQuery({
    queryKey: qk.me(),
    queryFn: () => getPerfil(),
    staleTime: 60_000,
  });

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (wsBound.current) return;
    wsBound.current = true;
    const onChange = () => qc.invalidateQueries({ queryKey: qk.me() });
    perfilService.onProfileChanged(onChange);
    return () => perfilService.offProfileChanged(onChange);
  }, [qc]);

  // Revocar URL temporal al desmontar
  useEffect(() => {
    return () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    };
  }, []);

  // Mutación para guardar perfil
  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: (payload: UpdatePerfilInput) => savePerfil(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: qk.me() });
      const prev = qc.getQueryData<Perfil>(qk.me());
      if (prev) {
        const optimistic: Perfil = {
          ...prev,
          nombre: payload.nombre ?? prev.nombre,
          apellido: payload.apellido ?? prev.apellido,
          telefono: payload.telefono ?? prev.telefono,
          correo: payload.correo ?? prev.correo,
          idFicha: payload.idFicha ?? prev.idFicha,
          estado: payload.estado ?? prev.estado,
          avatar:
            payload.avatar && payload.avatar instanceof File
              ? previewUrl ?? prev.avatar
              : typeof payload.avatar === "string"
              ? payload.avatar
              : prev.avatar,
        };
        qc.setQueryData(qk.me(), optimistic);
      }
      return { prev };
    },
    onError: (_e, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.me(), ctx.prev);
    },
    onSuccess: (res) => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      lastUrl.current = null;
      setPreviewUrl(null);
      if (res?.me) qc.setQueryData(qk.me(), res.me);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });

  // Manejar selección de avatar
  const handleAvatarPick = (file: File) => {
    const url = URL.createObjectURL(file);
    if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    lastUrl.current = url;
    setPreviewUrl(url);
    return file;
  };

  return { me: me ?? null, loading, saving, previewUrl, handleAvatarPick, save };
}
