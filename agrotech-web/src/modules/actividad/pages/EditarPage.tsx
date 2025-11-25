// src/modules/actividad/pages/EditarPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Input, Select, SelectItem } from "@heroui/react";
import { Calendar, ListChecks, Timer, HandCoins } from "lucide-react";
import type { Actividad } from "../model/types";
import { getActividadById, updateActividad } from "../api";

interface ActividadExtendida extends Actividad {
  id_tipo_actividad_fk?: number; // agregado para evitar errores de tipo
}

export default function EditarPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<Partial<ActividadExtendida>>({
    nombre_actividad: "",
    descripcion_actividad: "",
    estado_actividad: "En progreso",
    tiempo_actividad: 1,
    costo_mano_obra_actividad: "0",
    fecha_actividad: today,
    fecha_inicio_actividad: today,
    fecha_fin_actividad: today,
    id_tipo_actividad_fk: 1,
  });

  useEffect(() => {
    (async () => {
      if (!id) return;
      const numId = Number(id);
      if (Number.isNaN(numId)) {
        setError("ID inválido");
        setLoading(false);
        return;
      }
      try {
        const data = await getActividadById(numId);
        setForm({
          id_actividad_pk: data.id_actividad_pk,
          nombre_actividad: data.nombre_actividad,
          descripcion_actividad: data.descripcion_actividad,
          estado_actividad: data.estado_actividad,
          tiempo_actividad: data.tiempo_actividad,
          costo_mano_obra_actividad: String(data.costo_mano_obra_actividad),
          fecha_actividad: data.fecha_actividad?.slice(0, 10),
          fecha_inicio_actividad: data.fecha_inicio_actividad?.slice(0, 10),
          fecha_fin_actividad: data.fecha_fin_actividad?.slice(0, 10),
          id_tipo_actividad_fk: (data as any).id_tipo_actividad_fk ?? 1, // ✅ mantiene compatibilidad
        });
      } catch (e: any) {
        const msgBack = e?.response?.data?.message ?? "No se pudo cargar la actividad.";
        setError(Array.isArray(msgBack) ? msgBack.join(", ") : String(msgBack));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = <K extends keyof ActividadExtendida>(k: K, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const validar = (f: Partial<ActividadExtendida>): string | null => {
    if (!f.nombre_actividad?.trim()) return "El nombre es obligatorio.";
    if (!f.descripcion_actividad?.trim()) return "La descripción es obligatoria.";
    if (!f.fecha_actividad) return "Selecciona la fecha de actividad.";
    if (!f.fecha_inicio_actividad) return "Selecciona la fecha de inicio.";
    if (!f.fecha_fin_actividad) return "Selecciona la fecha de fin.";
    if (new Date(f.fecha_inicio_actividad) > new Date(f.fecha_fin_actividad))
      return "La fecha de inicio no puede ser mayor a la de fin.";
    if ((f.tiempo_actividad ?? 0) <= 0) return "El tiempo (horas) debe ser mayor a 0.";
    if ((f.id_tipo_actividad_fk ?? 0) <= 0) return "El tipo de actividad (ID) debe ser mayor a 0.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validar(form);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    try {
      setSaving(true);
      await updateActividad(Number(id), {
        nombre_actividad: form.nombre_actividad!,
        descripcion_actividad: form.descripcion_actividad!,
        estado_actividad: form.estado_actividad!,
        tiempo_actividad: Number(form.tiempo_actividad),
        costo_mano_obra_actividad: Number(form.costo_mano_obra_actividad),
        fecha_actividad: form.fecha_actividad!,
        fecha_inicio_actividad: form.fecha_inicio_actividad!,
        fecha_fin_actividad: form.fecha_fin_actividad!,
        id_tipo_actividad_fk: form.id_tipo_actividad_fk ?? 1, 
      });
      alert("Actividad actualizada");
      navigate("/actividades");
    } catch (e: any) {
      const msgBack = e?.response?.data?.message ?? "No se pudo actualizar la actividad.";
      setError(Array.isArray(msgBack) ? msgBack.join(", ") : String(msgBack));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 bg-default-200 rounded" />
            <div className="h-10 w-full bg-default-200 rounded" />
            <div className="h-10 w-full bg-default-200 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <Card className="p-8 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-8">
          <ListChecks className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Editar Actividad</h2>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Nombre de la actividad"
            placeholder="Ej. Deshierbe manual"
            variant="bordered"
            value={form.nombre_actividad ?? ""}
            onChange={(e) => onChange("nombre_actividad", e.target.value)}
            isRequired
          />

          <Select
            label="Estado"
            selectedKeys={new Set([form.estado_actividad ?? "En progreso"])}
            onSelectionChange={(keys) =>
              onChange("estado_actividad", Array.from(keys)[0] as string)
            }
            isRequired
          >
            <SelectItem key="Pendiente">Pendiente</SelectItem>
            <SelectItem key="En progreso">En progreso</SelectItem>
            <SelectItem key="Completada">Completada</SelectItem>
            <SelectItem key="Cancelada">Cancelada</SelectItem>
          </Select>

          <Input
            label="Descripción"
            placeholder="Describe brevemente la actividad"
            variant="bordered"
            value={form.descripcion_actividad ?? ""}
            onChange={(e) => onChange("descripcion_actividad", e.target.value)}
            className="sm:col-span-2"
            isRequired
          />

          <Input
            label="Tiempo (horas)"
            type="number"
            startContent={<Timer className="h-4 w-4 text-gray-500" />}
            variant="bordered"
            value={String(form.tiempo_actividad ?? 0)}
            onChange={(e) => onChange("tiempo_actividad", Number(e.target.value))}
            min={0}
            step="0.1"
          />

          <Input
            label="Costo mano de obra (COP)"
            type="number"
            startContent={<HandCoins className="h-4 w-4 text-gray-500" />}
            variant="bordered"
            value={String(form.costo_mano_obra_actividad ?? 0)}
            onChange={(e) => onChange("costo_mano_obra_actividad", e.target.value)}
            min={0}
            step="1000"
          />

          <Input
            label="Fecha de la actividad"
            type="date"
            startContent={<Calendar className="h-4 w-4 text-gray-500" />}
            variant="bordered"
            value={form.fecha_actividad ?? today}
            onChange={(e) => onChange("fecha_actividad", e.target.value)}
            isRequired
          />

          <Input
            label="Fecha de inicio"
            type="date"
            startContent={<Calendar className="h-4 w-4 text-gray-500" />}
            variant="bordered"
            value={form.fecha_inicio_actividad ?? today}
            onChange={(e) => onChange("fecha_inicio_actividad", e.target.value)}
            isRequired
          />

          <Input
            label="Fecha de fin"
            type="date"
            startContent={<Calendar className="h-4 w-4 text-gray-500" />}
            variant="bordered"
            value={form.fecha_fin_actividad ?? today}
            onChange={(e) => onChange("fecha_fin_actividad", e.target.value)}
            isRequired
          />

          <Input
            label="Tipo de actividad (ID)"
            placeholder="Ej. 1"
            type="number"
            variant="bordered"
            value={String(form.id_tipo_actividad_fk ?? 1)}
            onChange={(e) => onChange("id_tipo_actividad_fk", Number(e.target.value))}
            min={1}
            isRequired
          />

          {error && <p className="text-danger text-xs sm:col-span-2">{error}</p>}

          <div className="sm:col-span-2 flex justify-center mt-6 gap-3">
            <Button variant="light" onPress={() => navigate("/actividades")}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-3 rounded-lg font-medium shadow-sm transition"
              isLoading={saving}
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
