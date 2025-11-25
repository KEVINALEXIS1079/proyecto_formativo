import { useParams, useNavigate } from "react-router-dom";
import { useActividadById } from "../hooks/useActividadById";
import { useRemoveActividad } from "../hooks/useRemoveActividad";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";

export default function ActividadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const actividadId = id ? parseInt(id) : 0;

  const { data: actividad, isLoading, error } = useActividadById(actividadId);
  const removeMutation = useRemoveActividad();

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (error || !actividad) {
    return <div className="p-4">Error al cargar la actividad</div>;
  }

  const handleEdit = () => {
    navigate(`/actividades/${actividad.id}/editar`);
  };

  const handleDelete = async () => {
    if (confirm("¿Está seguro de eliminar esta actividad?")) {
      try {
        await removeMutation.mutateAsync(actividad.id);
        navigate("/actividades");
      } catch (error) {
        alert("Error al eliminar la actividad");
      }
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            onPress={() => navigate(-1)}
            startContent={<ArrowLeft />}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{actividad.nombre}</h1>
            <p className="text-gray-600">Detalle de la actividad</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button color="secondary" onPress={handleEdit}>
            Editar
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={removeMutation.isPending}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Información Básica</h2>
            <p><strong>Descripción:</strong> {actividad.descripcion}</p>
            <p><strong>Tipo:</strong> {actividad.tipoActividad.nombre}</p>
            <p><strong>Fecha:</strong> {new Date(actividad.fecha).toLocaleDateString()}</p>
            <p><strong>Fecha Inicio:</strong> {new Date(actividad.fechaInicio).toLocaleDateString()}</p>
            <p><strong>Fecha Fin:</strong> {new Date(actividad.fechaFin).toLocaleDateString()}</p>
            <p><strong>Costo Mano de Obra:</strong> ${actividad.costoManoObra}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Participantes</h2>
            {actividad.participantes.length > 0 ? (
              <ul>
                {actividad.participantes.map((p) => (
                  <li key={p.id}>
                    {p.usuario.nombre} - {p.rol || 'Sin rol'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay participantes</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Maquinaria</h2>
            <p>Maquinaria no disponible en el detalle actual</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Insumos</h2>
            {actividad.insumos.length > 0 ? (
              <ul>
                {actividad.insumos.map((i) => (
                  <li key={i.id}>
                    {i.insumo.nombre} - {i.cantidadUsada} {i.unidadMedida}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay insumos</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Evidencias</h2>
            {actividad.evidencias.length > 0 ? (
              <ul>
                {actividad.evidencias.map((e) => (
                  <li key={e.id}>
                    {e.nombre} - {e.descripcion}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay evidencias</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}