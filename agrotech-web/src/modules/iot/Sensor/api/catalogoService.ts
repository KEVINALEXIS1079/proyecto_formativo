// src/modules/iot/Sensor/api/catalogService.ts
import api from "@/shared/api/client";
import type { TipoSensorLite, LoteLite } from "../model/types";

export const catalogService = {
  async tipos(): Promise<TipoSensorLite[]> {
    const { data } = await api.get<any[]>("/tipo-sensor");
    return (data || []).map((t) => ({
      id_tipo_sensor_pk: t.id_tipo_sensor_pk,
      nombre_tipo_sensor: t.nombre_tipo_sensor,
      unidades_tipo_sensor: t.unidades_tipo_sensor ?? null,
    }));
  },

  async lotes(): Promise<LoteLite[]> {
    const { data } = await api.get<any[]>("/lotes");
    return (data || []).map((l) => ({
      id_lote_pk: l.id_lote_pk,
      nombre_lote: l.nombre_lote ?? null,
      codigo: l.codigo ?? null,
    }));
  },
};
