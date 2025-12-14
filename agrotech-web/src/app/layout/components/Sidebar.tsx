// src/app/layout/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { NAVIGATION_ITEMS } from "../navigation.config";

/** Props opcionales */
export type SidebarProps = {
  className?: string;
  onLogout?: () => void;
  accordion?: boolean; // si true, solo un submenú abierto a la vez
};

export default function Sidebar({
  className = "",
}: SidebarProps) {
  const { can } = useAuth();
  
  // Filter items based on permissions
  const visibleItems = NAVIGATION_ITEMS.filter(item => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  return (
    <aside
      className={`peer group/sidebar fixed top-0 left-0 bottom-0 z-40
      bg-white transition-all duration-300 ease-in-out
      w-16 hover:w-64 flex flex-col shadow-sm pb-3 ${className}`}
    >
      <nav className="pt-[74px] px-2 py-2 flex flex-col gap-1 flex-1 overflow-y-auto scroll-smooth">
        {visibleItems.map((item) => (
          <HoverItem 
            key={item.to} 
            to={item.to} 
            icon={item.icon} 
            label={item.label} 
          />
        ))}
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
