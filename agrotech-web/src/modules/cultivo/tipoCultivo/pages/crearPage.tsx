import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Input, Button, Card } from "@heroui/react";
import { Sprout  } from "lucide-react";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import { createTipoCultivo} from "../api/create";
import type { TipoCultivoPayload} from "../api/create";

export default function CrearPageTipoCultivo() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    setTitle("Registrar Tipo de Cultivo");
  }, [setTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!nombre.trim()) {
      setMensaje("❌ Completa el campo de nombre.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: TipoCultivoPayload = {
        nombre_tipo_cultivo: nombre.trim(),
      };

      await createTipoCultivo(payload);

      setMensaje("✅ Tipo de cultivo creado correctamente.");
      
      // Reset del formulario
      setNombre("");
      setTimeout(() => navigate("/cultivo"), 1200); // Redirige a listado si deseas
    } catch (err: any) {
      console.error("Error creando tipo de cultivo:", err);
      const backendMsg =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "No se pudo crear el tipo de cultivo.";
      setMensaje("❌ " + String(backendMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background-color: #f3f4f6; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #22c55e; border-radius: 9999px; }
  `;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-scroll h-[calc(100vh-10rem)] custom-scrollbar">
      <style>{scrollbarStyles}</style>

      <Card className="p-8 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-8">
          <Sprout  className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Registrar Tipo de Cultivo</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <Input
            label="Nombre del tipo de cultivo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            isRequired
          />

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-medium shadow-sm transition"
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>

        {mensaje && (
          <Card
            className={`mt-6 border ${
              mensaje.startsWith("✅") ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"
            }`}
          >
            <div className="p-3 text-center">
              <p className={`text-center font-medium ${mensaje.startsWith("✅") ? "text-green-700" : "text-red-700"}`}>
                {mensaje}
              </p>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}
