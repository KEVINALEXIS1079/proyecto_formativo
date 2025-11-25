import { Button, Input, Select, SelectItem, Textarea, Card, CardBody, CardHeader, Autocomplete, AutocompleteItem, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useActividadSubtiposList, QK_ACTIVIDAD_SUBTIPOS } from "../hooks/useActividadSubtipos";
import { useActividadCreate, useActividadUpdate } from "../hooks/useActividades";
import { useUsuariosList, useInsumosList, useLotesList, useSublotesList, useCultivosList, useSubtiposList, useCategoriasInsumoList, useServiciosList } from "../hooks/useRelatedLists";
import type { Actividad, CreateActividadInput, UpdateActividadInput, Usuario, Insumo } from "../model/types";
import { Plus, Trash2, X, Users, Package } from "lucide-react";
import SelectParticipantesModal from "../ui/SelectParticipantesModal";
import SelectInsumosModal from "../ui/SelectInsumosModal";

interface ActividadFormProps {
  actividad?: Actividad | null;
  onSuccess?: () => void;
}

export default function ActividadForm({ actividad, onSuccess }: ActividadFormProps) {
  const navigate = useNavigate();
  const isEdit = !!actividad;

  const [form, setForm] = useState<Partial<CreateActividadInput & UpdateActividadInput & { costo_por_hora: number }>>({
    nombre_actividad: "",
    descripcion_actividad: "",
    fecha_inicio_actividad: "",
    fecha_fin_actividad: "",
    id_tipo_actividad_fk: undefined,
    costo_mano_obra_actividad: 0,
    costo_por_hora: 0,
    fecha_actividad: "",
    id_lote_fk: undefined,
    id_sublote_fk: undefined,
    id_cultivo_fk: undefined,
    subtipos: [],
    participantes: [],
    servicios: [],
    insumos: [],
    evidencias: [],
  });

  // Estados para búsqueda
  const [usuarioSearch, setUsuarioSearch] = useState("");
  const [insumoSearch, setInsumoSearch] = useState("");
  const [categoriaInsumoId, setCategoriaInsumoId] = useState<number | undefined>();
  const [subtipoSearch, setSubtipoSearch] = useState("");
  const [servicioSearch, setServicioSearch] = useState("");
  const [nuevoSubtipo, setNuevoSubtipo] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Estados para modales
  const [isParticipantesModalOpen, setIsParticipantesModalOpen] = useState(false);
  const [isInsumosModalOpen, setIsInsumosModalOpen] = useState(false);

  const { data: subtipos = [] } = useActividadSubtiposList();

  // Hooks para listas relacionadas
  const { data: usuarios = [] } = useUsuariosList({ q: usuarioSearch });
  const { data: insumos = [] } = useInsumosList({ q: insumoSearch, categoriaId: categoriaInsumoId });
  const { data: categoriasInsumo = [] } = useCategoriasInsumoList({ q: "" });
  const { data: lotes = [] } = useLotesList({ q: "" });
  const { data: sublotess = [] } = useSublotesList({ loteId: form.id_lote_fk });
  const { data: cultivos = [] } = useCultivosList({ q: "" });
  const { data: subtiposExistentes = [] } = useSubtiposList({ q: subtipoSearch });
  const { data: servicios = [] } = useServiciosList({ q: servicioSearch });

  const qc = useQueryClient();
  const createMutation = useActividadCreate();
  const updateMutation = useActividadUpdate();

  // Sincronizar formulario
  useEffect(() => {
    if (actividad) {
      setForm({
        nombre_actividad: actividad.nombre,
        descripcion_actividad: actividad.descripcion || "",
        fecha_inicio_actividad: actividad.fechaInicio,
        fecha_fin_actividad: actividad.fechaFin || "",
        id_tipo_actividad_fk: actividad.tipoActividad.id,
        costo_mano_obra_actividad: actividad.costoManoObra,
        costo_por_hora: 0, // No disponible, se calcula si necesario
        fecha_actividad: actividad.fecha,
        id_lote_fk: actividad.lote?.id,
        id_sublote_fk: actividad.sublote?.id,
        id_cultivo_fk: actividad.cultivo?.id,
        subtipos: actividad.subtipos?.map(s => ({ id_subtipo_fk: s.id })) || [],
        participantes: actividad.participantes.map(p => ({
          id_usuario_fk: p.usuario.id,
          horas_trabajadas: 0, // No disponible en el tipo
          rol_participante: p.rol,
          observaciones_participante: p.observaciones,
        })),
        insumos: actividad.insumos.map(i => ({
          id_insumo_fk: i.insumo.id,
          cantidad_usada: i.cantidadUsada,
          precio_unitario: 0, // No disponible
          unidad_medida: i.unidadMedida,
          observaciones: i.observaciones,
        })),
        evidencias: actividad.evidencias.map(e => ({
          nombre_evidencia: e.nombre,
          descripcion_evidencia: e.descripcion,
          fecha_evidencia: e.fecha,
          observacion_evidencia: e.observacion,
          img_evidencia: e.imgUrl,
        })),
        servicios: [], // No disponible en el tipo Actividad
      });
    } else {
      setForm({
        nombre_actividad: "",
        descripcion_actividad: "",
        fecha_inicio_actividad: "",
        fecha_fin_actividad: "",
        id_tipo_actividad_fk: undefined,
        costo_mano_obra_actividad: 0,
        costo_por_hora: 0,
        fecha_actividad: "",
        id_lote_fk: undefined,
        id_sublote_fk: undefined,
        id_cultivo_fk: undefined,
        subtipos: [],
        participantes: [],
        servicios: [],
        insumos: [],
        evidencias: [],
      });
    }
  }, [actividad]);

  const totalHoras = useMemo(() => {
    return form.participantes?.reduce((sum, p) => sum + (p.horas_trabajadas || 0), 0) || 0;
  }, [form.participantes]);

  useEffect(() => {
    const costo = totalHoras * (form.costo_por_hora || 0);
    setForm(f => ({ ...f, costo_mano_obra_actividad: costo }));
  }, [totalHoras, form.costo_por_hora]);

  const canSubmit = useMemo(() => {
    return (
      (form.nombre_actividad?.trim()?.length || 0) > 0 &&
      form.fecha_inicio_actividad &&
      form.id_tipo_actividad_fk
    );
  }, [form]);

  // Función para crear nuevo subtipo
  const handleCreateSubtipo = () => {
    if (!nuevoSubtipo.trim()) return;
    setNuevoSubtipo("");
    // Agregar el nuevo subtipo a la lista
    setForm(f => ({
      ...f,
      subtipos: [...(f.subtipos || []), { nombre_subtipo: nuevoSubtipo }]
    }));
  };

  // Función para manejar upload de archivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const selectedSubtipoKey = String(form.id_tipo_actividad_fk || "");

  const subtipoOptions = subtipos.map((s) => ({ key: String(s.id), label: s.nombre }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (isEdit && actividad) {
        await updateMutation.mutateAsync({ id: actividad.id, dto: form as UpdateActividadInput });
      } else {
        await createMutation.mutateAsync(form as CreateActividadInput);
      }
      qc.invalidateQueries({ queryKey: QK_ACTIVIDAD_SUBTIPOS.LIST_ROOT });
      onSuccess?.();
      navigate("/actividades");
    } catch (error) {
      console.error("Error guardando actividad:", error);
    }
  };

  const addParticipante = () => {
    setForm(f => ({
      ...f,
      participantes: [...(f.participantes || []), { id_usuario_fk: 0, horas_trabajadas: 0, rol_participante: "", observaciones_participante: "" }]
    }));
  };

  const removeParticipante = (index: number) => {
    setForm(f => ({
      ...f,
      participantes: (f.participantes || []).filter((_, i) => i !== index)
    }));
  };

  const updateParticipante = (index: number, field: string, value: any) => {
    setForm(f => ({
      ...f,
      participantes: (f.participantes || []).map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const addServicio = () => {
    setForm(f => ({
      ...f,
      servicios: [...(f.servicios || []), { id_servicio_fk: 0, horas_usadas: 0 }]
    }));
  };

  const removeServicio = (index: number) => {
    setForm(f => ({
      ...f,
      servicios: (f.servicios || []).filter((_, i) => i !== index)
    }));
  };

  const updateServicio = (index: number, field: string, value: any) => {
    setForm(f => ({
      ...f,
      servicios: (f.servicios || []).map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const addInsumo = () => {
    setForm(f => ({
      ...f,
      insumos: [...(f.insumos || []), { id_insumo_fk: 0, cantidad_usada: 0, precio_unitario: 0, unidad_medida: "", observaciones: "" }]
    }));
  };

  const removeInsumo = (index: number) => {
    setForm(f => ({
      ...f,
      insumos: (f.insumos || []).filter((_, i) => i !== index)
    }));
  };

  const updateInsumo = (index: number, field: string, value: any) => {
    setForm(f => ({
      ...f,
      insumos: (f.insumos || []).map((ins, i) =>
        i === index ? { ...ins, [field]: value } : ins
      )
    }));
  };

  const addEvidencia = () => {
    setForm(f => ({
      ...f,
      evidencias: [...(f.evidencias || []), { nombre_evidencia: "", descripcion_evidencia: "", fecha_evidencia: "", observacion_evidencia: "", img_evidencia: "" }]
    }));
  };

  const removeEvidencia = (index: number) => {
    setForm(f => ({
      ...f,
      evidencias: (f.evidencias || []).filter((_, i) => i !== index)
    }));
  };

  const updateEvidencia = (index: number, field: string, value: any) => {
    setForm(f => ({
      ...f,
      evidencias: (f.evidencias || []).map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      )
    }));
  };

  // Funciones para manejar modales
  const handleParticipantesConfirm = (selectedUsers: Usuario[]) => {
    const newParticipantes = selectedUsers.map(user => ({
      id_usuario_fk: user.id,
      horas_trabajadas: 0, // Valor por defecto
      rol_participante: "",
      observaciones_participante: "",
    }));
    setForm(f => ({
      ...f,
      participantes: [...(f.participantes || []), ...newParticipantes]
    }));
  };

  const handleInsumosConfirm = (selectedInsumos: Insumo[]) => {
    const newInsumos = selectedInsumos.map(insumo => ({
      id_insumo_fk: insumo.id,
      cantidad_usada: 0, // Valor por defecto
      precio_unitario: insumo.precioUnitario || 0,
      unidad_medida: insumo.unidadBase || "",
      observaciones: "",
    }));
    setForm(f => ({
      ...f,
      insumos: [...(f.insumos || []), ...newInsumos]
    }));
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">{isEdit ? "Editar actividad" : "Crear nueva actividad"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={form.nombre_actividad || ""}
          onChange={(e) => setForm((s) => ({ ...s, nombre_actividad: e.target.value }))}
          placeholder="Nombre de la actividad"
          required
        />

        <Select
          label="Tipo de actividad"
          selectedKeys={new Set([selectedSubtipoKey])}
          onSelectionChange={(keys) => {
            const k = Array.from(keys as Set<string>)[0];
            setForm((s) => ({ ...s, id_tipo_actividad_fk: k ? Number(k) : undefined }));
          }}
          placeholder="Seleccionar tipo"
          required
        >
          {subtipoOptions.map((opt) => (
            <SelectItem key={opt.key} textValue={opt.label}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>


        <Select
          label="Lote"
          selectedKeys={new Set([String(form.id_lote_fk || "")])}
          onSelectionChange={(keys) => {
            const k = Array.from(keys as Set<string>)[0];
            setForm((s) => ({ ...s, id_lote_fk: k ? Number(k) : undefined, id_sublote_fk: undefined })); // Reset sublote
          }}
          placeholder="Seleccionar lote"
        >
          {lotes.map((lote) => (
            <SelectItem key={String(lote.id)} textValue={lote.nombre}>
              {lote.nombre}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Sublote"
          selectedKeys={new Set([String(form.id_sublote_fk || "")])}
          onSelectionChange={(keys) => {
            const k = Array.from(keys as Set<string>)[0];
            setForm((s) => ({ ...s, id_sublote_fk: k ? Number(k) : undefined }));
          }}
          placeholder="Seleccionar sublote"
          isDisabled={!form.id_lote_fk}
        >
          {sublotess.map((sublote) => (
            <SelectItem key={String(sublote.id)} textValue={sublote.nombre}>
              {sublote.nombre}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Cultivo"
          selectedKeys={new Set([String(form.id_cultivo_fk || "")])}
          onSelectionChange={(keys) => {
            const k = Array.from(keys as Set<string>)[0];
            setForm((s) => ({ ...s, id_cultivo_fk: k ? Number(k) : undefined }));
          }}
          placeholder="Seleccionar cultivo"
        >
          {cultivos.map((cultivo) => (
            <SelectItem key={String(cultivo.id)} textValue={cultivo.nombre}>
              {cultivo.nombre}
            </SelectItem>
          ))}
        </Select>

        {/* Visualización cultivo asociado */}
        {form.id_cultivo_fk && (
          <Card className="bg-green-50 border-green-200">
            <CardBody>
              <h4 className="font-semibold text-green-800">Cultivo Asociado</h4>
              <p className="text-green-700">
                {cultivos.find(c => c.id === form.id_cultivo_fk)?.nombre || `Cultivo ID: ${form.id_cultivo_fk}`}
              </p>
            </CardBody>
          </Card>
        )}

        <Input
          type="date"
          label="Fecha de inicio"
          value={form.fecha_inicio_actividad || ""}
          onChange={(e) => setForm((s) => ({ ...s, fecha_inicio_actividad: e.target.value }))}
          required
        />

        <Input
          type="date"
          label="Fecha de fin (opcional)"
          value={form.fecha_fin_actividad || ""}
          onChange={(e) => setForm((s) => ({ ...s, fecha_fin_actividad: e.target.value }))}
        />

        <Input
          type="number"
          label="Costo por hora de mano de obra"
          value={String(form.costo_por_hora || 0)}
          onChange={(e) => setForm((s) => ({ ...s, costo_por_hora: Number(e.target.value) }))}
          placeholder="Costo por hora"
          min="0"
          step="0.01"
        />

        <Input
          type="number"
          label="Total horas"
          value={String(totalHoras)}
          readOnly
          placeholder="Total horas calculado"
        />

        <Input
          type="number"
          label="Costo mano de obra"
          value={String(form.costo_mano_obra_actividad || 0)}
          readOnly
          placeholder="Costo calculado"
        />
      </div>

      <Textarea
        label="Descripción (opcional)"
        value={form.descripcion_actividad || ""}
        onChange={(e) => setForm((s) => ({ ...s, descripcion_actividad: e.target.value }))}
        placeholder="Descripción de la actividad"
        minRows={3}
      />

      {/* Subtipos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Subtipos</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-2">
            <Autocomplete
              label="Seleccionar subtipo existente"
              placeholder="Buscar subtipo..."
              selectedKey={null}
              onSelectionChange={(key) => {
                if (key && !form.subtipos?.some(s => s.id_subtipo_fk === Number(key))) {
                  setForm(f => ({
                    ...f,
                    subtipos: [...(f.subtipos || []), { id_subtipo_fk: Number(key) }]
                  }));
                }
              }}
              onInputChange={setSubtipoSearch}
              className="flex-1"
            >
              {subtiposExistentes.map((subtipo) => (
                <AutocompleteItem key={String(subtipo.id)} textValue={subtipo.nombre}>
                  {subtipo.nombre}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <div className="flex gap-2 items-end">
              <Input
                label="Nuevo subtipo"
                placeholder="Nombre del nuevo subtipo"
                value={nuevoSubtipo}
                onChange={(e) => setNuevoSubtipo(e.target.value)}
                className="w-48"
              />
              <Button
                onPress={handleCreateSubtipo}
                isDisabled={!nuevoSubtipo.trim()}
              >
                Crear
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.subtipos || []).map((subtipo, index) => {
              const subtipoData = subtiposExistentes.find(s => s.id === subtipo.id_subtipo_fk);
              return (
                <div key={index} className="flex items-center gap-2 bg-default-100 px-3 py-1 rounded-full">
                  <span>{subtipo.nombre_subtipo || subtipoData?.nombre || `Subtipo ${subtipo.id_subtipo_fk}`}</span>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => setForm(f => ({
                      ...f,
                      subtipos: (f.subtipos || []).filter((_, i) => i !== index)
                    }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Participantes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes
            </h3>
            <Button
              size="sm"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => setIsParticipantesModalOpen(true)}
            >
              Agregar participantes
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="text-sm text-default-600">
            Participantes seleccionados: {(form.participantes || []).length}
          </div>

          {/* Chips de participantes */}
          <div className="flex flex-wrap gap-2">
            {(form.participantes || []).map((p, index) => {
              const usuario = usuarios.find(u => u.id === p.id_usuario_fk);
              return (
                <Chip
                  key={index}
                  variant="flat"
                  onClose={() => removeParticipante(index)}
                  className="cursor-pointer"
                >
                  {usuario ? `${usuario.nombre} ${usuario.apellido}` : `Usuario ${p.id_usuario_fk}`}
                </Chip>
              );
            })}
          </div>

          {/* Tabla de participantes con detalles editables */}
          {(form.participantes || []).length > 0 && (
            <Table aria-label="Tabla de participantes" className="mt-4">
              <TableHeader>
                <TableColumn>Participante</TableColumn>
                <TableColumn>Horas Trabajadas</TableColumn>
                <TableColumn>Rol</TableColumn>
                <TableColumn>Observaciones</TableColumn>
                <TableColumn width={50}>Acciones</TableColumn>
              </TableHeader>
              <TableBody>
                {(form.participantes || []).map((p, index) => {
                  const usuario = usuarios.find(u => u.id === p.id_usuario_fk);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {usuario ? `${usuario.nombre} ${usuario.apellido}` : `Usuario ${p.id_usuario_fk}`}
                          </span>
                          {usuario && (
                            <span className="text-small text-default-500">
                              ID: {usuario.idFicha} • {usuario.cedula}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(p.horas_trabajadas || 0)}
                          onChange={(e) => updateParticipante(index, 'horas_trabajadas', Number(e.target.value))}
                          min="0"
                          step="0.5"
                          size="sm"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={p.rol_participante || ""}
                          onChange={(e) => updateParticipante(index, 'rol_participante', e.target.value)}
                          size="sm"
                          placeholder="Rol"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={p.observaciones_participante || ""}
                          onChange={(e) => updateParticipante(index, 'observaciones_participante', e.target.value)}
                          size="sm"
                          placeholder="Observaciones"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" color="danger" variant="light" onPress={() => removeParticipante(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Servicios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Servicios</h3>
            <Button size="sm" startContent={<Plus className="h-4 w-4" />} onPress={addServicio}>
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {(form.servicios || []).map((s, index) => {
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <Autocomplete
                  label="Servicio"
                  placeholder="Buscar servicio..."
                  selectedKey={String(s.id_servicio_fk || "")}
                  onSelectionChange={(key) => updateServicio(index, 'id_servicio_fk', key ? Number(key) : undefined)}
                  onInputChange={setServicioSearch}
                  className="md:col-span-1"
                >
                  {servicios.map((servicio) => (
                    <AutocompleteItem key={String(servicio.id)} textValue={servicio.nombre}>
                      {servicio.nombre}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <Input
                  label="Horas usadas"
                  type="number"
                  value={String(s.horas_usadas || 0)}
                  onChange={(e) => updateServicio(index, 'horas_usadas', Number(e.target.value))}
                />
                <Button size="sm" color="danger" onPress={() => removeServicio(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Insumos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Insumos
            </h3>
            <Button
              size="sm"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => setIsInsumosModalOpen(true)}
            >
              Agregar insumos
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Tabla de insumos seleccionados */}
          {(form.insumos || []).length > 0 ? (
            <Table aria-label="Tabla de insumos" className="mt-4">
              <TableHeader>
                <TableColumn>Insumo</TableColumn>
                <TableColumn>Cantidad Usada</TableColumn>
                <TableColumn>Unidad Base</TableColumn>
                <TableColumn>Stock Actual</TableColumn>
                <TableColumn>Costo Aproximado</TableColumn>
                <TableColumn>Observaciones</TableColumn>
                <TableColumn width={50}>Acciones</TableColumn>
              </TableHeader>
              <TableBody>
                {(form.insumos || []).map((ins, index) => {
                  const insumo = insumos.find(i => i.id === ins.id_insumo_fk);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {insumo ? insumo.nombre : `Insumo ${ins.id_insumo_fk}`}
                          </span>
                          {insumo?.categoria && (
                            <span className="text-small text-default-500">
                              {insumo.categoria.nombre}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(ins.cantidad_usada || 0)}
                          onChange={(e) => updateInsumo(index, 'cantidad_usada', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          size="sm"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{ins.unidad_medida || insumo?.unidadBase || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{insumo?.stockTotalBase || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          ${((insumo?.precioUnitario || 0) * (ins.cantidad_usada || 0)).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={ins.observaciones || ""}
                          onChange={(e) => updateInsumo(index, 'observaciones', e.target.value)}
                          size="sm"
                          placeholder="Observaciones"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" color="danger" variant="light" onPress={() => removeInsumo(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-default-500">
              No hay insumos seleccionados. Haz clic en "Agregar insumos" para seleccionar.
            </div>
          )}
        </CardBody>
      </Card>

      {/* Evidencias */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evidencias</h3>
            <Button size="sm" startContent={<Plus className="h-4 w-4" />} onPress={addEvidencia}>
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Upload múltiple */}
          <div>
            <label className="block text-sm font-medium mb-2">Subir archivos</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button size="sm" variant="light" onPress={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(form.evidencias || []).map((e, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <Input
                label="Nombre evidencia"
                value={e.nombre_evidencia || ""}
                onChange={(ev) => updateEvidencia(index, 'nombre_evidencia', ev.target.value)}
              />
              <Input
                label="Descripción"
                value={e.descripcion_evidencia || ""}
                onChange={(ev) => updateEvidencia(index, 'descripcion_evidencia', ev.target.value)}
              />
              <Input
                label="Fecha"
                type="date"
                value={e.fecha_evidencia || ""}
                onChange={(ev) => updateEvidencia(index, 'fecha_evidencia', ev.target.value)}
              />
              <Input
                label="Observación"
                value={e.observacion_evidencia || ""}
                onChange={(ev) => updateEvidencia(index, 'observacion_evidencia', ev.target.value)}
              />
              <Button size="sm" color="danger" onPress={() => removeEvidencia(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="flat" onPress={() => navigate("/actividades")}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onPress={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isDisabled={!canSubmit}
        >
          {isEdit ? "Guardar cambios" : "Crear actividad"}
        </Button>
      </div>
    </div>

    {/* Modales */}
    <SelectParticipantesModal
      isOpen={isParticipantesModalOpen}
      onClose={() => setIsParticipantesModalOpen(false)}
      onConfirm={handleParticipantesConfirm}
      selectedIds={(form.participantes || []).map(p => p.id_usuario_fk)}
    />

    <SelectInsumosModal
      isOpen={isInsumosModalOpen}
      onClose={() => setIsInsumosModalOpen(false)}
      onConfirm={handleInsumosConfirm}
      selectedIds={(form.insumos || []).map(i => i.id_insumo_fk)}
    />
  </>
  );
}