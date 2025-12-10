import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAlmacenById } from "../hooks/useAlmacenById";
import { useRemoveAlmacen } from "../hooks/useRemoveAlmacen";
import { useInsumoList } from "../hooks/useInsumoList";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../ui/widgets/ConfirmationModal";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "descripcion", label: "Descripción" },
  { key: "categoria", label: "Categoría" },
  { key: "proveedor", label: "Proveedor" },
  { key: "almacen", label: "Almacén" },
  { key: "stock", label: "Stock" },
];

export default function DetalleAlmacenPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const almacenId = id ? parseInt(id) : 0;

  const { data: almacen, isLoading, error } = useAlmacenById(almacenId);
  const removeMutation = useRemoveAlmacen();
  const { data: insumosData } = useInsumoList({ almacenId });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const insumos = (insumosData as any)?.items || (insumosData as any) || [];

  const renderCell = (item: any, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre;
      case "descripcion":
        return item.descripcion || "N/A";
      case "categoria":
        return item.categoria.nombre;
      case "proveedor":
        return item.proveedor.nombre;
      case "almacen":
        return item.almacen.nombre;
      case "stock":
        return item.stockPresentaciones;
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !almacen) {
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
            <p className="text-gray-600 text-lg">No se pudo cargar la información del almacén. Por favor, intenta nuevamente.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/inventario/almacenes/${almacen.id}/editar`);
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeMutation.mutateAsync(almacen.id);
      navigate("/inventario/almacenes");
    } catch (error) {
      alert("Error al eliminar el almacén");
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Detalle de Almacén</h1>
                <p className="text-gray-600 text-lg">Información completa del almacén seleccionado</p>
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
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {removeMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            Información Básica
          </h2>
          <div className="space-y-6">
            <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nombre</label>
              <p className="mt-2 text-xl font-medium text-gray-900">{almacen.nombre}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Descripción</label>
              <p className="mt-2 text-gray-700 leading-relaxed">{almacen.descripcion || "Sin descripción"}</p>
            </div>
          </div>
        </div>

        {/* Insumos relacionados */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
            Insumos en este Almacén
          </h2>
          <Table aria-label="Tabla de insumos" removeWrapper isVirtualized={false}>
            <TableHeader columns={columns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody items={insumos} emptyContent="No hay insumos en este almacén">
              {(item: any) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar el almacén '${almacen.nombre}'?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}