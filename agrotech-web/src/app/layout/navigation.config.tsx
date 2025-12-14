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

export interface NavigationItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  permission: string | null; // null means always visible
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    to: "/home",
    icon: <HomeIcon className="h-5 w-5" />,
    label: "Inicio",
    permission: null,
  },
  {
    to: "/usuarios",
    icon: <Users className="h-5 w-5" />,
    label: "Gestión Usuarios",
    permission: "usuarios.ver",
  },
  {
    to: "/geo",
    icon: <Map className="h-5 w-5" />,
    label: "Georreferenciación",
    permission: "lotes.ver",
  },
  {
    to: "/inventario",
    icon: <Boxes className="h-5 w-5" />,
    label: "Gestión de Inventario",
    permission: "inventario.ver",
  },
  {
    to: "/actividades",
    icon: <ListChecks className="h-5 w-5" />,
    label: "Gestión de Actividades",
    permission: "actividades.ver",
  },
  {
    to: "/cultivos",
    icon: <Sprout className="h-5 w-5" />,
    label: "Gestión de Cultivos",
    permission: "cultivos.ver",
  },
  {
    to: "/fitosanitario",
    icon: <Leaf className="h-5 w-5" />,
    label: "Fitosanitario",
    permission: "wiki.ver",
  },
  {
    to: "/iot",
    icon: <Cpu className="h-5 w-5" />,
    label: "Monitoreo de cultivos",
    permission: "iot.ver",
  },
  {
    to: "/production",
    icon: <Wallet className="h-5 w-5" />,
    label: "Producción y Ventas",
    permission: "produccion.ver", // Changed from ventas.ver to produccion.ver base permission
  },
  {
    to: "/reportes",
    icon: <FileBarChart className="h-5 w-5" />,
    label: "Analítica y Reportes",
    permission: "reportes.ver",
  },
];
