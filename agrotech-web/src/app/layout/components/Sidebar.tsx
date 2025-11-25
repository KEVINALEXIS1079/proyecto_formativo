// src/app/layout/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Sprout,
  Cpu,
  Wallet,
  Boxes,
  FileBarChart,
  Users,
  ListChecks,
  ChevronRight,
  ToggleRight,
  Leaf,
} from "lucide-react";

/** Props opcionales */
export type SidebarProps = {
  className?: string;
  onLogout?: () => void;
  accordion?: boolean; // si true, solo un submenú abierto a la vez
};

export default function Sidebar({
  className = "",
  accordion = true,
}: SidebarProps) {
  const location = useLocation();

  /** Estados de submenús */
  const [openCultivos, setOpenCultivos] = useState(false);
  const [openLotes, setOpenLotes] = useState(false);
  const [openSublotes, setOpenSublotes] = useState(false);
  const [openIot, setOpenIot] = useState(location.pathname.startsWith("/iot"));
  const [openActividad, setOpenActividad] = useState(
    location.pathname.startsWith("/actividades")
  );
  const [openUsuario, setOpenUsuario] = useState(
    location.pathname.startsWith("/usuarios")
  );
  const [openFito, setOpenFito] = useState(
    location.pathname.startsWith("/fitosanitario")
  );
  const [openFinanzas, setOpenFinanzas] = useState(
    location.pathname.startsWith("/finanzas")
  );
  const [openInventario, setOpenInventario] = useState(
    location.pathname.startsWith("/inventario") || location.pathname.startsWith("/insumos")
  );
  const [openReportes, setOpenReportes] = useState(
    location.pathname.startsWith("/reportes")
  );
  const [openPermisos, setOpenPermisos] = useState(
    location.pathname.startsWith("/permisos")
  );

  /** Abrir "Cultivos" si la ruta actual pertenece a ese contexto */
  useEffect(() => {
    const isCultivos =
      location.pathname.startsWith("/cultivos") ||
      location.pathname.startsWith("/lotes") ||
      location.pathname.startsWith("/sublotes");
    if (isCultivos) setOpenCultivos(true);
  }, [location.pathname]);

  /** Cerrar todos los submenús */
  const closeAll = () => {
    setOpenCultivos(false);
    setOpenLotes(false);
    setOpenSublotes(false);
    setOpenIot(false);
    setOpenActividad(false);
    setOpenUsuario(false);
    setOpenFito(false);
    setOpenFinanzas(false);
    setOpenInventario(false);
    setOpenReportes(false);
    setOpenPermisos(false);
  };

  /** Cierra los demás cuando accordion=true */
  const closeOthers = (except: string) => {
    if (!accordion) return;
    setOpenCultivos(except === "cultivos" ? (v) => v : false);
    setOpenLotes(except === "lotes" ? (v) => v : false);
    setOpenSublotes(except === "sublotes" ? (v) => v : false);
    setOpenIot(except === "iot" ? (v) => v : false);
    setOpenActividad(except === "actividad" ? (v) => v : false);
    setOpenUsuario(except === "usuario" ? (v) => v : false);
    setOpenFito(except === "fito" ? (v) => v : false);
    setOpenFinanzas(except === "finanzas" ? (v) => v : false);
    setOpenInventario(except === "inventario" ? (v) => v : false);
    setOpenReportes(except === "reportes" ? (v) => v : false);
    setOpenPermisos(except === "permisos" ? (v) => v : false);
  };

  return (
    <aside
      onMouseLeave={closeAll}
      className={`peer group/sidebar fixed top-16 left-0 bottom-0 z-30
      bg-white transition-all duration-300 ease-in-out
      w-16 hover:w-64 flex flex-col shadow-sm pb-3 ${className}`}
    >
      <nav className="mt-4 px-2 py-2 flex flex-col gap-1 flex-1 overflow-y-auto scroll-smooth">
        <HoverItem to="/home" icon={<HomeIcon className="h-5 w-5" />} label="Inicio" />

        {/* ACTIVIDADES */}
        <SidebarItemWithChildren
          to="/actividades"
          icon={<ListChecks className="h-5 w-5" />}
          label="Actividades"
          isOpen={openActividad}
          onToggle={() => {
            closeOthers("actividad");
            setOpenActividad((v) => !v);
          }}
          childrenLinks={[{ to: "/actividades/crear", label: "Registrar actividad" }]}
        />

        {/* CULTIVOS */}
        <SidebarItemWithChildren
          to="/cultivos"
          icon={<Sprout className="h-5 w-5" />}
          label="Cultivos"
          isOpen={openCultivos}
          onToggle={() => {
            closeOthers("cultivos");
            setOpenCultivos((v) => !v);
          }}
          childrenLinks={[
            { to: "/listar-cultivo", label: "Historial de cultivo" },
            { to: "/registrar-cultivo", label: "Registrar cultivo" },
            { to: "/editar-cultivo", label: "Editar cultivo" },
            { to: "/tipo-cultivo/crear", label: "Registrar tipo de cultivo" },
          ]}
        />

        {/* SUBMENÚS DENTRO DE CULTIVOS */}
        {openCultivos && (
          <div className="pl-10 space-y-1">
            <SidebarItemWithChildren
              to="/lotes/listar"
              icon={<Boxes className="h-5 w-5" />}
              label="Lotes"
              isOpen={openLotes}
              onToggle={() => setOpenLotes((v) => !v)}
              childrenLinks={[
                { to: "/lotes/listar", label: "Historial de lotes" },
                { to: "/lotes/crear", label: "Registrar lote" },
              ]}
            />
            <SidebarItemWithChildren
              to="/sublotes/listar"
              icon={<Boxes className="h-5 w-5" />}
              label="Sublotes"
              isOpen={openSublotes}
              onToggle={() => setOpenSublotes((v) => !v)}
              childrenLinks={[
                { to: "/sublotes/listar", label: "Historial de sublotes" },
                { to: "/sublotes/crear", label: "Registrar sublote" },
              ]}
            />
          </div>
        )}

        {/* FITOSANITARIO */}
        <SidebarItemWithChildren
          to="/fitosanitario"
          icon={<Leaf className="h-5 w-5" />}
          label="Fitosanitario"
          isOpen={openFito}
          onToggle={() => {
            closeOthers("fito");
            setOpenFito((v) => !v);
          }}
          childrenLinks={[
            { to: "/fitosanitario", label: "Lista" },
            { to: "/fitosanitario/tipos", label: "Tipos EPA" },
            { to: "/fitosanitario/tipo-cultivos", label: "Tipos Cultivo EPA" },
          ]}
        />

        {/* IOT */}
        <SidebarItemWithChildren
          to="/SensoresLivePage"
          icon={<Cpu className="h-5 w-5" />}
          label="IoT"
          isOpen={openIot}
          onToggle={() => {
            closeOthers("iot");
            setOpenIot((v) => !v);
          }}
          childrenLinks={[
             { to: "/SensoresLivePage", label: "Monitoreo iot" },
          ]}
        />

        {/* FINANZAS */}
        <SidebarItemWithChildren
           to="/finanzas"
           icon={<Wallet className="h-5 w-5" />}
           label="Finanzas"
           isOpen={openFinanzas}
           onToggle={() => {
             closeOthers("finanzas");
             setOpenFinanzas((v) => !v);
           }}
           childrenLinks={[
             { to: "/lista-finanzas", label: "Historial de finanzas" },
             { to: "/crear-finanzas", label: "Registrar finanzas" },
             { to: "/editar-finanzas", label: "Editar finanzas" },
             { to: "/finanzas/ventas", label: "Ventas" },
           ]}
         />

        {/* INVENTARIO */}
        <SidebarItemWithChildren
           to="/inventario"
           icon={<Boxes className="h-5 w-5" />}
           label="Inventario"
           isOpen={openInventario}
           onToggle={() => {
             closeOthers("inventario");
             setOpenInventario((v) => !v);
           }}
           childrenLinks={[
             { to: "/inventario", label: "Inventario de Insumos" },
             { to: "/inventario/categorias", label: "Categorías de insumos" },
             { to: "/inventario/proveedores", label: "Proveedores" },
             { to: "/inventario/almacenes", label: "Almacenes" },
             { to: "/inventario/historial-movimientos", label: "Historial de Movimientos" }
           ]}
         />

        {/* REPORTES */}
        <SidebarItemWithChildren
           to="/reportes"
           icon={<FileBarChart className="h-5 w-5" />}
           label="Reportes"
           isOpen={openReportes}
           onToggle={() => {
             closeOthers("reportes");
             setOpenReportes((v) => !v);
           }}
           childrenLinks={[
             { to: "/lista-reportes", label: "Lista de reportes" },
             { to: "/crear-reporte", label: "Crear reporte" },
             { to: "/editar-reporte", label: "Editar reporte" },
             { to: "/reportes/cultivo", label: "Reportes de cultivo" },
             { to: "/reportes/lote", label: "Reportes por lote" },
           ]}
         />

        {/* PERMISOS */}
        <SidebarItemWithChildren
          to="/permisos"
          icon={<ToggleRight className="h-5 w-5" />}
          label="Permisos"
          isOpen={openPermisos}
          onToggle={() => {
            closeOthers("permisos");
            setOpenPermisos((v) => !v);
          }}
          childrenLinks={[
            { to: "/lista-permisos", label: "Lista de permisos" },
            { to: "/crear-permiso", label: "Crear permiso" },
            { to: "/permisos-asignar-usuario", label: "Asignar permisos usuarios" },
            { to: "/permisos-asignar-rol", label: "Asignar permisos rol" },
            { to: "/quitar-permisos-usuario", label: "Quitar permisos usuario" },
          ]}
        />

        {/* USUARIOS */}
        <SidebarItemWithChildren
          to="/usuarios"
          icon={<Users className="h-5 w-5" />}
          label="Usuarios"
          isOpen={openUsuario}
          onToggle={() => {
            closeOthers("usuario");
            setOpenUsuario((v) => !v);
          }}
          childrenLinks={[
            { to: "/lista-usuarios", label: "Lista de usuarios" },
            { to: "/usuario-registrar", label: "Registrar usuario" },
            { to: "/perfil", label: "Perfil" },
          ]}
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

function SidebarItemWithChildren({
  icon,
  label,
  to,
  childrenLinks,
  isOpen,
  onToggle,
}: ItemBaseProps & {
  childrenLinks: Array<{ to: string; label: string; icon?: React.ReactNode }>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const isParentActive =
    location.pathname === to || location.pathname.startsWith(to + "/");
  const hasActiveChild = childrenLinks.some(
    (c) => location.pathname === c.to || location.pathname.startsWith(c.to + "/")
  );
  const base =
    "flex items-center rounded-md transition-colors h-10 px-2 hover:bg-default-100 text-foreground-600";
  const active = "bg-success/10 text-success hover:bg-success/10";
  const submenuId = `submenu-${to.replace(/\//g, "-")}`;

  return (
    <div className="relative">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${base} ${isActive || isParentActive ? active : ""}`
        }
        aria-expanded={isOpen}
        aria-controls={submenuId}
      >
        <span
          className={`grid place-items-center h-10 w-10 shrink-0 transition-colors duration-300 ${
            isOpen || isParentActive || hasActiveChild
              ? "text-success/70"
              : "text-foreground-600"
          }`}
        >
          {icon}
        </span>
        <span className="ml-0 text-sm whitespace-nowrap overflow-hidden flex items-center gap-2 w-0 opacity-0 transition-all duration-200 group-hover/sidebar:ml-2 group-hover/sidebar:w-40 group-hover/sidebar:opacity-100">
          {label}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className="ml-auto hidden items-center justify-center w-6 h-6 rounded hover:bg-default-100 group-hover/sidebar:flex"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Ocultar submenú" : "Mostrar submenú"}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-300 ease-out ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>
      </NavLink>

      <div
        id={submenuId}
        className={`pl-10 pr-2 overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? "max-h-96 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1"
        }`}
      >
        <ul className="mt-1 mb-2 space-y-1">
          {childrenLinks.map((child) => (
            <li key={child.to}>
              <SubItem to={child.to} label={child.label} icon={child.icon} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SubItem({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  const base =
    "flex items-center h-9 rounded-md text-sm px-2 hover:bg-default-100 text-foreground-600 transition-colors";
  const active = "bg-success/10 text-success hover:bg-success/20";
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? active : ""}`}
    >
      <span className="mr-2 h-4 w-4 flex items-center justify-center">
        {icon || <span className="h-2 w-2 rounded-full bg-success/60" />}
      </span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
