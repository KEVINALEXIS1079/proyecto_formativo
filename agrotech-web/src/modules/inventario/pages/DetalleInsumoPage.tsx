import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInsumoById } from "../hooks/useInsumoById";
import { useRemoveInsumo } from "../hooks/useRemoveInsumo";
import { useMovimientoList } from "../hooks/useMovimientoList";
import { useInventarioRealtime } from "../hooks/useInventarioRealtime";
import { updateMovimiento, removeMovimiento } from "../api/movimientos.service";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../ui/widgets/ConfirmationModal";
import { Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Image } from "@heroui/react";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

const columns = [
  { key: "tipo", label: "Tipo" },
  { key: "cantidad", label: "Cantidad" },
  { key: "fecha", label: "Fecha" },
  { key: "usuario", label: "Usuario" },
  { key: "descripcion", label: "Descripción" },
  { key: "actividad", label: "Actividad" },
  { key: "acciones", label: "Acciones" },
];

export default function DetalleInsumoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const insumoId = id ? parseInt(id) : 0;

  const { data: insumo, isLoading, error } = useInsumoById(insumoId);
  const removeMutation = useRemoveInsumo();
  const { data: movimientos } = useMovimientoList({ idInsumo: insumoId, limit: 50 });

  useInventarioRealtime();

  const updateMovimientoMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateMovimiento(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventario", "insumo"] });
    },
  });

  const removeMovimientoMutation = useMutation({
    mutationFn: (id: number) => removeMovimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventario", "insumo"] });
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMovimiento, setEditMovimiento] = useState<any>(null);
  const [deleteMovimiento, setDeleteMovimiento] = useState<any>(null);
  const [filtros, setFiltros] = useState({
    idFicha: '',
    nombre: '',
    identificacionUsuario: '',
    categoria: '',
    nombreInsumo: ''
  });

  const isFertilizante = insumo?.categoria.nombre.toLowerCase().includes('fertilizante') || false;
  const movimientosFiltrados = movimientos?.filter(mov => {
    const matchesIdFicha = !filtros.idFicha || insumo?.id.toString().includes(filtros.idFicha);
    const matchesNombre = !filtros.nombre || insumo?.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const matchesIdentificacionUsuario = !filtros.identificacionUsuario || mov.usuarioResponsable?.identificacion?.toLowerCase().includes(filtros.identificacionUsuario.toLowerCase());
    const matchesCategoria = !isFertilizante || !filtros.categoria || insumo?.categoria.nombre.toLowerCase().includes(filtros.categoria.toLowerCase());
    const matchesNombreInsumo = !isFertilizante || !filtros.nombreInsumo || insumo?.nombre.toLowerCase().includes(filtros.nombreInsumo.toLowerCase());
    return matchesIdFicha && matchesNombre && matchesIdentificacionUsuario && matchesCategoria && matchesNombreInsumo;
  }) || [];

  const renderCell = (item: any, columnKey: string) => {
    switch (columnKey) {
      case "tipo":
        return item.tipoMovimiento;
      case "cantidad":
        return item.cantidadPresentaciones;
      case "fecha":
        return new Date(item.fechaMovimiento).toLocaleDateString();
      case "usuario":
        return item.usuarioResponsable?.nombreUsuario || 'N/A';
      case "descripcion":
        return item.descripcion;
      case "actividad":
        return item.id_actividad_fk ? (
          <button
            onClick={() => navigate(`/actividades/${item.id_actividad_fk}`)}
            className="text-blue-600 hover:text-blue-900 underline"
            title="Ver Actividad"
          >
            Ver Actividad
          </button>
        ) : null;
      case "acciones":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEditMovimiento(item)}
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
              title="Editar movimiento"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteMovimiento(item)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Eliminar movimiento"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="h-80 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                  <div className="space-y-6">
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Historial de Movimientos */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                Historial de Movimientos
              </h2>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  label="ID de Ficha"
                  value={filtros.idFicha}
                  onChange={(e) => setFiltros({ ...filtros, idFicha: e.target.value })}
                  placeholder="Filtrar por ID"
                />
                <Input
                  label="Nombre"
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                  placeholder="Filtrar por nombre"
                />
                <Input
                  label="Identificación Usuario"
                  value={filtros.identificacionUsuario}
                  onChange={(e) => setFiltros({ ...filtros, identificacionUsuario: e.target.value })}
                  placeholder="Filtrar por identificación"
                />
                {isFertilizante && (
                  <>
                    <Input
                      label="Categoría"
                      value={filtros.categoria}
                      onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                      placeholder="Filtrar por categoría"
                    />
                    <Input
                      label="Nombre Insumo"
                      value={filtros.nombreInsumo}
                      onChange={(e) => setFiltros({ ...filtros, nombreInsumo: e.target.value })}
                      placeholder="Filtrar por nombre insumo"
                    />
                  </>
                )}
              </div>
              <Table aria-label="Tabla de movimientos" removeWrapper isVirtualized={false}>
                <TableHeader columns={columns}>
                  {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={movimientosFiltrados} emptyContent="No hay movimientos registrados">
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        </div>
    );
  }

  if (error || !insumo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error al Cargar</h1>
            <p className="text-gray-600 text-lg">No se pudo cargar la información del insumo. Por favor, intenta nuevamente.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/inventario/${insumo.id}/editar`);
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (descripcion: string) => {
    try {
      await removeMutation.mutateAsync({ id: insumo.id, payload: { descripcion } });
      navigate("/inventario");
    } catch (error) {
      alert("Error al eliminar el insumo");
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEditMovimiento = (movimiento: any) => {
    setEditMovimiento(movimiento);
  };

  const handleDeleteMovimiento = (movimiento: any) => {
    setDeleteMovimiento(movimiento);
  };

  const handleConfirmEditMovimiento = async (nuevaCantidad: number) => {
    if (!editMovimiento) return;
    try {
      await updateMovimientoMutation.mutateAsync({
        id: editMovimiento.id,
        payload: { cantidadPresentaciones: nuevaCantidad },
      });
      setEditMovimiento(null);
    } catch (error) {
      alert("Error al actualizar el movimiento");
    }
  };

  const handleConfirmDeleteMovimiento = async () => {
    if (!deleteMovimiento) return;
    try {
      await removeMovimientoMutation.mutateAsync(deleteMovimiento.id);
      setDeleteMovimiento(null);
    } catch (error) {
      alert("Error al eliminar el movimiento");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header con botones */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
                title="Volver"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Detalle de Insumo</h1>
                <p className="text-gray-600 text-lg">Información completa del insumo seleccionado</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={removeMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {removeMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Imagen */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              Imagen del Insumo
            </h2>
            <div className="flex justify-center">
              {insumo.imagenUrl ? (
                <Image
                  src={
                    /^(data:|blob:|https?:\/\/)/i.test(insumo.imagenUrl)
                      ? insumo.imagenUrl
                      : `${FILES_BASE.replace(/\/+$/, "")}/${insumo.imagenUrl.replace(/^\/+/, "")}`
                  }
                  alt={insumo.nombre}
                  className="max-w-full h-80 object-cover rounded-xl shadow-lg"
                  onError={() => console.error('Error loading image')}
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-gray-500 text-lg font-medium">Sin imagen disponible</span>
                </div>
              )}
            </div>
          </div>

          {/* Información básica */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              Información Básica
            </h2>
            <div className="space-y-6">
              <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nombre</label>
                <p className="mt-2 text-xl font-medium text-gray-900">{insumo.nombre}</p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Descripción</label>
                <p className="mt-2 text-gray-700 leading-relaxed">{insumo.descripcion || "Sin descripción"}</p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Fecha de Registro</label>
                <p className="mt-2 text-lg font-medium text-gray-900">{insumo.fechaIngreso ? new Date(insumo.fechaIngreso).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Presentación */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              Presentación
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Tipo</label>
                <p className="mt-2 text-lg font-medium text-gray-900 capitalize">{insumo.presentacionTipo}</p>
              </div>
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Cantidad</label>
                <p className="mt-2 text-lg font-medium text-gray-900">{insumo.presentacionCantidad} {insumo.presentacionUnidad}</p>
              </div>
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Unidad Base</label>
                <p className="mt-2 text-lg font-medium text-gray-900">{insumo.unidadBase}</p>
              </div>
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Factor de Conversión</label>
                <p className="mt-2 text-lg font-medium text-gray-900">{insumo.factorConversion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Stock */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
              Stock Disponible
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 text-center">
                <label className="block text-sm font-semibold text-emerald-700 uppercase tracking-wide">Presentaciones</label>
                <p className="mt-3 text-4xl font-bold text-emerald-600">{insumo.stockPresentaciones}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 text-center">
                <label className="block text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Base</label>
                <p className="mt-3 text-4xl font-bold text-blue-600">
                  {insumo.stockTotalBase} <span className="text-lg">{insumo.unidadBase}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
              Información de Precios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 text-center">
                <label className="block text-sm font-semibold text-amber-700 uppercase tracking-wide">Precio Unitario</label>
                <p className="mt-3 text-3xl font-bold text-amber-600">
                  {insumo.precioUnitario ? `$${insumo.precioUnitario.toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 text-center">
                <label className="block text-sm font-semibold text-indigo-700 uppercase tracking-wide">Precio Total</label>
                <p className="mt-3 text-3xl font-bold text-indigo-600">
                  {insumo.precioTotal ? `$${insumo.precioTotal.toLocaleString()}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Relaciones */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full"></div>
              Relaciones y Asociaciones
            </h2>
            <div className="space-y-6">
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"></div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Categoría</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">{insumo.categoria.nombre}</p>
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"></div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Proveedor</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">{insumo.proveedor.nombre}</p>
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-violet-500 rounded-full"></div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Almacén</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">{insumo.almacen.nombre}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar el insumo '${insumo.nombre}'?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isLoading={removeMutation.isPending}
      />

      {/* Modal para editar movimiento */}
      {editMovimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Movimiento</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Cantidad de Presentaciones
              </label>
              <input
                type="number"
                defaultValue={editMovimiento.cantidadPresentaciones}
                onChange={(e) => setEditMovimiento({ ...editMovimiento, cantidadPresentaciones: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirmEditMovimiento(editMovimiento.cantidadPresentaciones)}
                disabled={updateMovimientoMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMovimientoMutation.isPending ? "Actualizando..." : "Actualizar"}
              </button>
              <button
                onClick={() => setEditMovimiento(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación de movimiento */}
      {deleteMovimiento && (
        <ConfirmationModal
          isOpen={!!deleteMovimiento}
          onClose={() => setDeleteMovimiento(null)}
          onConfirm={handleConfirmDeleteMovimiento}
          title="Confirmar eliminación"
          message={`¿Está seguro de que desea eliminar este movimiento de ${deleteMovimiento.cantidadPresentaciones} presentaciones?`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isLoading={removeMovimientoMutation.isPending}
        />
      )}
    </div>
  );
}