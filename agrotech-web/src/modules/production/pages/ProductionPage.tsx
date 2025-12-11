import { useState } from "react";
import { ShoppingBag, History, Package } from "lucide-react";
import PosPage from "./PosPage";
import SalesHistory from "../widgets/SalesHistory";
import ProductionInventory from "../widgets/ProductionInventory";
import Surface from "@/modules/users/ui/Surface";
import PillToggle from "@/modules/actividad/ui/PillToggle";

export default function ProductionPage() {
    const [selected, setSelected] = useState("pos");

    return (
        <div className="mx-auto max-w-7xl space-y-5 p-4">
            {/* Title */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Producción y Ventas</h1>
                <p className="text-sm opacity-70">Gestiona ventas, inventario de lotes y historial de transacciones</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <PillToggle
                    value={selected}
                    onChange={(v) => setSelected(v)}
                    options={[
                        { value: "pos", label: "Punto de Venta", icon: ShoppingBag },
                        { value: "historial", label: "Historial", icon: History },
                        { value: "inventario", label: "Inventario", icon: Package },
                    ]}
                />
            </div>

            {/* Content */}
            <Surface className="overflow-hidden p-0 min-h-[600px]">
                <div className="h-full">
                    {selected === "pos" && <PosPage />}
                    {selected === "historial" && <SalesHistory />}
                    {selected === "inventario" && <ProductionInventory />}
                </div>
            </Surface>
        </div>
    );
}
