import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button as IconButton } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Checkbox } from "@heroui/checkbox";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Plus, Trash2 } from "lucide-react";
import type { CreateActividadInput, CreateEvidenciaInput, CreateParticipanteInput, CreateInsumoInput, CreateServicioInput } from "../model/types";
import { uploadEvidencia } from "../api/actividades.service";
import { useUsuariosList, useInsumosList, useLotesList, useSublotesList, useCultivosList, useCategoriasInsumoList, useServiciosList } from "../hooks/useRelatedLists";
import { useTipoActividadList, useTipoActividadCreate } from "../hooks/useTipoActividad";
import { useActividadSubtiposList } from "../hooks/useActividadSubtipos";

interface ActividadFormProps {
  initialValues?: Partial<CreateActividadInput>;
  onSubmit: (data: CreateActividadInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const FILES_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "http://localhost:4000";

export default function ActividadForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = "Guardar",
}: ActividadFormProps) {
  const [formData, setFormData] = useState({
    fecha_actividad: new Date().toISOString().split('T')[0],
    fecha_inicio_actividad: new Date().toISOString().split('T')[0],
    fecha_fin_actividad: new Date().toISOString().split('T')[0],
    participantes: [],
    insumos: [],
    servicios: [],
    tipo_actividad: "",
    estado_actividad: "Completada",
    id_tipo_actividad_fk: undefined,
    subtipo: "",
    ...initialValues,
  });

  const [evidencias, setEvidencias] = useState<{ descripcion: string, archivos: File[] }[]>([]);
  const [participantes, setParticipantes] = useState<CreateParticipanteInput[]>([]);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<CreateInsumoInput[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<CreateServicioInput[]>([]);
  const [servicioSearch, setServicioSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalInsumosOpen, setIsModalInsumosOpen] = useState(false);
  const [selectedInsumos, setSelectedInsumos] = useState<{id: number, cantidad: number}[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | undefined>();
  const [insumoSearch, setInsumoSearch] = useState('');
  const [currentPageInsumos, setCurrentPageInsumos] = useState(1);
  const pageSizeInsumos = 10;

  const [isModalTipoOpen, setIsModalTipoOpen] = useState(false);
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');

  const { data: usuarios } = useUsuariosList({ limit: 100 });
  const { data: insumos } = useInsumosList({ limit: 100 });
  const { data: categoriasInsumo } = useCategoriasInsumoList();
  const { data: insumosFiltrados } = useInsumosList({ categoriaId: categoriaSeleccionada, q: insumoSearch, limit: 100 });
  const { data: lotes } = useLotesList();
  const { data: sublotes } = useSublotesList({ loteId: formData.id_lote_fk });
  const { data: cultivos } = useCultivosList();
  const { data: servicios } = useServiciosList({ q: servicioSearch });
  const { data: tiposActividad } = useTipoActividadList();
  const { data: subtiposActividad } = useActividadSubtiposList({ tipoActividadId: formData.id_tipo_actividad_fk });
  const createTipoMutation = useTipoActividadCreate();

  const modalFilteredUsers = usuarios?.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.idFicha.toString().includes(searchTerm)
  ) || [];
  const totalPages = Math.ceil(modalFilteredUsers.length / pageSize);
  const paginatedUsers = modalFilteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (formData.id_lote_fk !== undefined) {
      setFormData(prev => ({ ...prev, id_sublote_fk: undefined })); // Reset sublote
    }
  }, [formData.id_lote_fk]);

  useEffect(() => {
    if (initialValues.participantes) {
      setParticipantes(initialValues.participantes.map(p => ({ ...p, horas_trabajadas: p.horas_trabajadas || 0 })));
    }
  }, [initialValues.participantes]);

  useEffect(() => {
    if (initialValues.insumos) {
      setInsumosSeleccionados(initialValues.insumos);
    }
  }, [initialValues.insumos]);

  useEffect(() => {
    if (initialValues.servicios) {
      setServiciosSeleccionados(initialValues.servicios);
    }
  }, [initialValues.servicios]);

  const canSubmit = () => {
    return (
      formData.descripcion_actividad?.trim() &&
      formData.nombre_actividad?.trim() &&
      formData.costo_mano_obra_actividad !== undefined &&
      formData.costo_mano_obra_actividad > 0 &&
      formData.fecha_actividad?.trim() &&
      formData.fecha_inicio_actividad?.trim() &&
      formData.fecha_fin_actividad?.trim() &&
      formData.estado_actividad?.trim() &&
      formData.id_tipo_actividad_fk !== undefined
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) {
      console.error('Faltan campos requeridos');
      return;
    }
    try {
      const evidenciasToSubmit: CreateEvidenciaInput[] = [];
      for (const evidencia of evidencias) {
        for (const file of evidencia.archivos) {
          const uploadResult = await uploadEvidencia(file);
          evidenciasToSubmit.push({
            nombre_evidencia: '',
            descripcion_evidencia: evidencia.descripcion,
            fecha_evidencia: new Date().toISOString().split('T')[0],
            observacion_evidencia: '',
            img_evidencia: uploadResult.path,
          });
        }
      }

      const subtiposToSubmit = formData.subtipo?.trim() ? [{ nombre_subtipo: formData.subtipo.trim() }] : [];

      const dataToSubmit = {
        ...formData,
        participantes,
        insumos: insumosSeleccionados,
        servicios: serviciosSeleccionados,
        evidencias: evidenciasToSubmit,
        subtipos: subtiposToSubmit,
      } as CreateActividadInput;
      onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error uploading evidencias:', error);
      // TODO: Handle error
    }
  };



  const updateParticipante = (index: number, field: keyof CreateParticipanteInput, value: any) => {
    const updated = [...participantes];
    updated[index] = { ...updated[index], [field]: value };
    setParticipantes(updated);
  };


  const updateInsumo = (index: number, field: keyof CreateInsumoInput, value: any) => {
    const updated = [...insumosSeleccionados];
    updated[index] = { ...updated[index], [field]: value };
    setInsumosSeleccionados(updated);
  };

  const addServicio = () => {
    setServiciosSeleccionados([...serviciosSeleccionados, { id_servicio_fk: 0, horas_usadas: 0 }]);
  };

  const removeServicio = (index: number) => {
    setServiciosSeleccionados(serviciosSeleccionados.filter((_, i) => i !== index));
  };

  const updateServicio = (index: number, field: keyof CreateServicioInput, value: any) => {
    const updated = [...serviciosSeleccionados];
    updated[index] = { ...updated[index], [field]: value };
    setServiciosSeleccionados(updated);
  };

  const addEvidencia = () => {
    setEvidencias([...evidencias, { descripcion: '', archivos: [] }]);
  };

  const removeEvidencia = (index: number) => {
    setEvidencias(evidencias.filter((_, i) => i !== index));
  };

  const updateEvidencia = (index: number, field: keyof typeof evidencias[0], value: any) => {
    const updated = [...evidencias];
    updated[index] = { ...updated[index], [field]: value };
    setEvidencias(updated);
  };

  const handleCreateTipo = async () => {
    if (!nuevoTipoNombre.trim()) return;
    try {
      const result = await createTipoMutation.mutateAsync({ nombre: nuevoTipoNombre.trim() });
      setFormData({ ...formData, id_tipo_actividad_fk: result.id, tipo_actividad: nuevoTipoNombre.trim() });
      setNuevoTipoNombre('');
      setIsModalTipoOpen(false);
    } catch (error) {
      console.error('Error creando tipo:', error);
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={formData.nombre_actividad || ""}
          onChange={(e) => setFormData({ ...formData, nombre_actividad: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-end gap-2">
          <Select
            label="Tipo de Actividad"
            selectedKeys={formData.id_tipo_actividad_fk !== undefined ? [formData.id_tipo_actividad_fk.toString()] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string | undefined;
              const id = selected ? parseInt(selected) : undefined;
              const tipo = id ? tiposActividad?.find(t => t.id === id)?.nombre || "" : "";
              setFormData({ ...formData, tipo_actividad: tipo, id_tipo_actividad_fk: id, subtipo: "" }); // Reset subtipo
            }}
            required
            className="flex-1"
          >
            {tiposActividad?.map((tipo) => (
              <SelectItem key={tipo.id}>
                {tipo.nombre}
              </SelectItem>
            )) || []}
          </Select>
          <Button onClick={() => setIsModalTipoOpen(true)} color="primary" size="sm" className="mb-1">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Select
          label="Lote"
          selectedKeys={formData.id_lote_fk ? [formData.id_lote_fk.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData({ ...formData, id_lote_fk: selected ? parseInt(selected) : undefined });
          }}
        >
          {lotes?.map((lote) => (
            <SelectItem key={lote.id}>
              {lote.nombre}
            </SelectItem>
          )) || []}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Subtipo de Actividad"
          value={formData.subtipo || ""}
          onChange={(e) => setFormData({ ...formData, subtipo: e.target.value })}
          placeholder="Escribe el nombre del subtipo"
          isDisabled={!formData.id_tipo_actividad_fk}
        />
        <Select
          label="Cultivo"
          selectedKeys={formData.id_cultivo_fk ? [formData.id_cultivo_fk.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData({ ...formData, id_cultivo_fk: selected ? parseInt(selected) : undefined });
          }}
        >
          {cultivos?.map((cultivo) => (
            <SelectItem key={cultivo.id}>
              {cultivo.nombre}
            </SelectItem>
          )) || []}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Sublote"
          selectedKeys={formData.id_sublote_fk ? [formData.id_sublote_fk.toString()] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData({ ...formData, id_sublote_fk: selected ? parseInt(selected) : undefined });
          }}
          isDisabled={!formData.id_lote_fk}
        >
          {sublotes?.map((sublote) => (
            <SelectItem key={sublote.id}>
              {sublote.nombre}
            </SelectItem>
          )) || []}
        </Select>
      </div>


      <Textarea
        label="Descripción"
        value={formData.descripcion_actividad || ""}
        onChange={(e) => setFormData({ ...formData, descripcion_actividad: e.target.value })}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Fecha"
          type="date"
          value={formData.fecha_actividad || ""}
          onChange={(e) => setFormData({ ...formData, fecha_actividad: e.target.value })}
          required
        />
        <Input
          label="Fecha Inicio"
          type="date"
          value={formData.fecha_inicio_actividad || ""}
          onChange={(e) => setFormData({ ...formData, fecha_inicio_actividad: e.target.value })}
          required
        />
        <Input
          label="Fecha Fin"
          type="date"
          value={formData.fecha_fin_actividad || ""}
          onChange={(e) => setFormData({ ...formData, fecha_fin_actividad: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Costo Mano de Obra"
          type="number"
          value={formData.costo_mano_obra_actividad?.toString() || ""}
          onChange={(e) => setFormData({ ...formData, costo_mano_obra_actividad: parseFloat(e.target.value) })}
          required
        />
      </div>

      {/* Participantes */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Participantes</h3>
        </CardHeader>
        <CardBody>
          <Button onClick={() => { setSelectedIds(participantes.map(p => p.id_usuario_fk)); setIsModalOpen(true); }}>Seleccionar Participantes</Button>
          {participantes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Participantes Seleccionados:</h4>
              {participantes
                .map((p, index) => {
                  const user = usuarios?.find(u => u.id === p.id_usuario_fk);
                  return { ...p, user, index };
                })
                .filter(item => item.user)
                .sort((a, b) => a.user!.nombre.localeCompare(b.user!.nombre))
                .map(({ user, index, horas_trabajadas }) => (
                  <div key={user!.id} className="flex items-center gap-4 mb-2 p-2 border rounded">
                    <span className="flex-1">{user!.nombre} {user!.apellido} ({user!.cedula}) - ID Ficha: {user!.idFicha}</span>
                    <Input
                      type="number"
                      label="Horas Trabajadas"
                      value={horas_trabajadas.toString()}
                      onChange={(e) => updateParticipante(index, 'horas_trabajadas', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className="w-32"
                    />
                  </div>
                ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="4xl">
        <ModalContent>
          <ModalHeader>Seleccionar Participantes</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Buscar por nombre, apellido, identificación o ID ficha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <Table>
              <TableHeader>
                <TableColumn>Seleccionar</TableColumn>
                <TableColumn>Nombre y Apellido</TableColumn>
                <TableColumn>Identificación</TableColumn>
                <TableColumn>ID Ficha</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedIds.includes(u.id)}
                        onValueChange={(checked) => {
                          if (checked) {
                            setSelectedIds([...selectedIds, u.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== u.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{u.nombre} {u.apellido}</TableCell>
                    <TableCell>{u.cedula}</TableCell>
                    <TableCell>{u.idFicha}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-center mt-4">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                setParticipantes(selectedIds.map(id => ({ id_usuario_fk: id, horas_trabajadas: 0 })));
                setIsModalOpen(false);
              }}
              color="primary"
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalInsumosOpen} onOpenChange={setIsModalInsumosOpen} size="5xl">
        <ModalContent>
          <ModalHeader>Seleccionar Insumos</ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <Select
                label="Categoría de Insumos"
                selectedKeys={categoriaSeleccionada ? [categoriaSeleccionada.toString()] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setCategoriaSeleccionada(selected ? parseInt(selected) : undefined);
                }}
                placeholder="Seleccionar categoría"
              >
                {categoriasInsumo?.map((categoria) => (
                  <SelectItem key={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                )) || []}
              </Select>
            </div>
            <Input
              placeholder="Buscar insumos..."
              value={insumoSearch}
              onChange={(e) => setInsumoSearch(e.target.value)}
              className="mb-4"
            />
            <Table>
              <TableHeader>
                <TableColumn>Seleccionar</TableColumn>
                <TableColumn>Nombre</TableColumn>
                <TableColumn>Stock</TableColumn>
                <TableColumn>Presentación</TableColumn>
                <TableColumn>Imagen</TableColumn>
                <TableColumn>Cantidad</TableColumn>
              </TableHeader>
              <TableBody>
                {insumosFiltrados?.slice((currentPageInsumos - 1) * pageSizeInsumos, currentPageInsumos * pageSizeInsumos).map((insumo) => {
                  const selected = selectedInsumos.find(s => s.id === insumo.id);
                  return (
                    <TableRow key={insumo.id}>
                      <TableCell>
                        <Checkbox
                          isSelected={!!selected}
                          onValueChange={(checked) => {
                            if (checked) {
                              setSelectedInsumos([...selectedInsumos, { id: insumo.id, cantidad: 0 }]);
                            } else {
                              setSelectedInsumos(selectedInsumos.filter(s => s.id !== insumo.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{insumo.nombre}</TableCell>
                      <TableCell>{insumo.stockTotalBase} {insumo.unidadBase}</TableCell>
                      <TableCell>{insumo.presentacionCantidad} {insumo.presentacionUnidad} {insumo.presentacionTipo}</TableCell>
                      <TableCell>
                        {insumo.imagenUrl ? (
                          <img src={
                            /^(data:|blob:|https?:\/\/)/i.test(insumo.imagenUrl)
                              ? insumo.imagenUrl
                              : `${FILES_BASE.replace(/\/+$/, "")}/${insumo.imagenUrl.replace(/^\/+/, "")}`
                          } alt={insumo.nombre} className="w-10 h-10 object-cover" />
                        ) : (
                          <span>No imagen</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {selected && (
                          <Input
                            type="number"
                            label="Cantidad (g)"
                            min="0"
                            max={insumo.stockTotalBase.toString()}
                            value={selected.cantidad.toString()}
                            onChange={(e) => {
                              const cantidad = parseFloat(e.target.value) || 0;
                              setSelectedInsumos(selectedInsumos.map(s => s.id === insumo.id ? { ...s, cantidad } : s));
                            }}
                            className="w-20"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }) || []}
              </TableBody>
            </Table>
            <div className="flex justify-center mt-4">
              <Pagination
                total={Math.ceil((insumosFiltrados?.length || 0) / pageSizeInsumos)}
                page={currentPageInsumos}
                onChange={setCurrentPageInsumos}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalInsumosOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                setInsumosSeleccionados(selectedInsumos.map(s => ({
                  id_insumo_fk: s.id,
                  cantidad_usada: s.cantidad,
                })));
                setIsModalInsumosOpen(false);
              }}
              color="primary"
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Insumos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Insumos</h3>
        </CardHeader>
        <CardBody>
          <Button onClick={() => { setSelectedInsumos(insumosSeleccionados.map(i => ({ id: i.id_insumo_fk, cantidad: i.cantidad_usada }))); setIsModalInsumosOpen(true); }}>Seleccionar Insumos</Button>
          {insumosSeleccionados.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Insumos Seleccionados:</h4>
              {insumosSeleccionados
                .map((insumo, index) => {
                  const insumoData = insumos?.find(i => i.id === insumo.id_insumo_fk);
                  return { ...insumo, insumoData, index };
                })
                .filter(item => item.insumoData)
                .sort((a, b) => a.insumoData!.nombre.localeCompare(b.insumoData!.nombre))
                .map(({ insumoData, cantidad_usada, index }) => (
                  <div key={insumoData!.id} className="flex items-center gap-4 mb-2 p-2 border rounded">
                    <span className="flex-1">{insumoData!.nombre} (Stock: {insumoData!.stockTotalBase} {insumoData!.unidadBase})</span>
                    <Input
                      type="number"
                      label="Cantidad (g)"
                      value={cantidad_usada.toString()}
                      onChange={(e) => updateInsumo(index, 'cantidad_usada', parseFloat(e.target.value) || 0)}
                      min="0"
                      max={insumoData!.stockTotalBase.toString()}
                      className="w-24"
                    />
                  </div>
                ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Servicios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Servicios</h3>
            <IconButton onClick={addServicio} color="primary" size="sm">
              <Plus className="w-4 h-4" />
            </IconButton>
          </div>
        </CardHeader>
        <CardBody>
          {serviciosSeleccionados.map((servicio, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Servicio {index + 1}</span>
                <IconButton onClick={() => removeServicio(index)} color="danger" size="sm">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete
                  label="Servicio"
                  placeholder="Buscar servicio..."
                  selectedKey={servicio.id_servicio_fk ? servicio.id_servicio_fk.toString() : ""}
                  onSelectionChange={(key) => updateServicio(index, 'id_servicio_fk', key ? parseInt(key as string) : undefined)}
                  onInputChange={setServicioSearch}
                >
                  {servicios?.map((serv: any) => (
                    <AutocompleteItem key={serv.id} textValue={serv.nombre}>
                      {serv.nombre}
                    </AutocompleteItem>
                  )) || []}
                </Autocomplete>
                <Input
                  label="Horas Usadas"
                  type="number"
                  value={servicio.horas_usadas.toString()}
                  onChange={(e) => updateServicio(index, 'horas_usadas', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
          ))}
          {serviciosSeleccionados.length === 0 && (
            <p className="text-gray-500 text-center">No hay servicios agregados</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evidencias</h3>
            <IconButton onClick={addEvidencia} color="primary" size="sm">
              <Plus className="w-4 h-4" />
            </IconButton>
          </div>
        </CardHeader>
        <CardBody>
          {evidencias.map((evidencia, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Evidencia {index + 1}</span>
                <IconButton onClick={() => removeEvidencia(index)} color="danger" size="sm">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
              <Textarea
                label="Descripción"
                value={evidencia.descripcion}
                onChange={(e) => updateEvidencia(index, 'descripcion', e.target.value)}
                required
              />
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Archivos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => updateEvidencia(index, 'archivos', Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {evidencia.archivos.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {evidencia.archivos.length} archivo(s) seleccionado(s)
                  </p>
                )}
              </div>
            </div>
          ))}
          {evidencias.length === 0 && (
            <p className="text-gray-500 text-center">No hay evidencias agregadas</p>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalTipoOpen} onOpenChange={setIsModalTipoOpen}>
        <ModalContent>
          <ModalHeader>Crear Nuevo Tipo de Actividad</ModalHeader>
          <ModalBody>
            <Input
              label="Nombre del Tipo"
              value={nuevoTipoNombre}
              onChange={(e) => setNuevoTipoNombre(e.target.value)}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalTipoOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreateTipo}
              color="primary"
              isLoading={createTipoMutation.isPending}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        isDisabled={!canSubmit()}
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
}