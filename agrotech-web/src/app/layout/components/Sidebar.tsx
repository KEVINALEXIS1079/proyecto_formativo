// src/app/layout/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Sprout,
  Cpu,
  Wallet,
  Boxes,
  FileBarChart,
  Users,
  ListChecks,
  Leaf,
  Map,
} from "lucide-react";

/** Props opcionales */
export type SidebarProps = {
  className?: string;
  onLogout?: () => void;
  accordion?: boolean; // si true, solo un submenú abierto a la vez
};

export default function Sidebar({
  className = "",
}: SidebarProps) {
  return (
    <aside
      className={`peer group/sidebar fixed top-0 left-0 bottom-0 z-40
      bg-white transition-all duration-300 ease-in-out
      w-16 hover:w-64 flex flex-col shadow-sm pb-3 ${className}`}
    >
      <nav className="pt-[74px] px-2 py-2 flex flex-col gap-1 flex-1 overflow-y-auto scroll-smooth">
        <HoverItem to="/home" icon={<HomeIcon className="h-5 w-5" />} label="Inicio" />

        {/* ACTIVIDADES */}
        <HoverItem
          to="/actividades"
          icon={<ListChecks className="h-5 w-5" />}
          label="Gestión de Actividades"
        />

        {/* GEO */}
        <HoverItem
          to="/geo"
          icon={<Map className="h-5 w-5" />}
          label="Georreferenciación"
        />

        {/* CULTIVOS */}
        <HoverItem
          to="/cultivos"
          icon={<Sprout className="h-5 w-5" />}
          label="Gestión de Cultivos"
        />

        {/* FITOSANITARIO */}
        <HoverItem
          to="/fitosanitario"
          icon={<Leaf className="h-5 w-5" />}
          label="Fitosanitario"
        />

        {/* IOT */}
        <HoverItem
          to="/iot"
          icon={<Cpu className="h-5 w-5" />}
          label="Monitoreo de cultivos"
        />

        {/* FINANZAS */}
        <HoverItem
          to="/finanzas"
          icon={<Wallet className="h-5 w-5" />}
          label="Producción y ventas"
        />

        {/* INVENTARIO */}
        <HoverItem
          to="/inventario"
          icon={<Boxes className="h-5 w-5" />}
          label="Gestión de Inventario"
        />

        {/* REPORTES */}
        <HoverItem
          to="/reportes"
          icon={<FileBarChart className="h-5 w-5" />}
          label="Analítica y Reportes"
        />

        {/* USUARIOS */}
        <HoverItem
          to="/usuarios"
          icon={<Users className="h-5 w-5" />}
          label="Gestión Usuarios"
        />
      </nav>
    </aside>
  );
}

/* =================== Items internos =================== */

type ItemBaseProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
};

function HoverItem({ icon, label, to }: ItemBaseProps) {
  const base =
    "flex items-center rounded-md transition-colors h-10 px-2 hover:bg-default-100 text-foreground-600";
  const active = "bg-success/10 text-success hover:bg-success/10";
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? active : ""}`}
    >
      <span className="grid place-items-center h-10 w-10 shrink-0">{icon}</span>
      <span className="ml-0 text-sm whitespace-nowrap overflow-hidden w-0 opacity-0 transition-all duration-200 group-hover/sidebar:ml-2 group-hover/sidebar:w-40 group-hover/sidebar:opacity-100">
        {label}
      </span>
    </NavLink>
  );
}

// End of components
