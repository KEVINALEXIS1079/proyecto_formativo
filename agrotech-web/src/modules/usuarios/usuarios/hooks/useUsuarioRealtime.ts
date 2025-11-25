// src/modules/usuarios/usuarios/hooks/useUsuariosLive.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usuarioService } from "../api/usuario.service";

export function useUsuarioRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["usuarios", "list"], exact: false });
    };


    usuarioService.connect();
    usuarioService.onListChanged(invalidate);


    return () => {
      usuarioService.offListChanged();
 
    };
  }, [qc]);
}
