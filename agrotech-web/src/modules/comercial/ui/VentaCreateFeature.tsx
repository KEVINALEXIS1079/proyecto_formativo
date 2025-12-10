import { useNavigate } from "react-router-dom";
import { useCreateVenta } from "../hooks";
import VentaForm from "../widgets/VentaForm";
import type { CreateVentaDTO } from "../model/types";

export default function VentaCreateFeature() {
  const navigate = useNavigate();
  const { createVenta, loading, error } = useCreateVenta();

  const handleSubmit = async (data: CreateVentaDTO) => {
    const result = await createVenta(data);
    if (result) {
      navigate("/finanzas/ventas");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <VentaForm onSubmit={handleSubmit} loading={loading} />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}