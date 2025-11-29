import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import Sidebar from "./components/Sidebar";
import ProtectedHeader from "./components/ProtectedHeader";

export type LayoutContext = { setTitle: (t: string) => void };

export default function ProtectedLayout() {
  const [title, setTitle] = useState("Inicio");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isLoading, error } = useProfile();
  
  const user = profile ? {
    name: `${profile.nombre} ${profile.apellido}`,
    email: profile.correo,
    role: profile.rol?.nombre ?? "Sin rol",
    avatarUrl: profile.avatarUrl 
      ? (profile.avatarUrl.startsWith('http') 
          ? profile.avatarUrl 
          : `http://localhost:4000${profile.avatarUrl.startsWith('/') ? '' : '/'}${profile.avatarUrl}`)
      : undefined,
  } : null;

  const notifs = [
    { id: "n1", title: "Alerta de pH bajo", body: "El cultivo de cacao presenta bajos niveles de pH.", unread: true, time: "hace 2 min" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* Barra superior (vuelve a aparecer) */}
      <ProtectedHeader
        title={title}
        user={user}
        loading={isLoading}
        notifications={notifs}
        onLogout={handleLogout}
      />

      {/* Menú lateral (queda debajo de la barra; nota el top-16 en Sidebar) */}
      <Sidebar onLogout={handleLogout} />

      {/* Contenido */}
      <main className="relative p-4 md:p-6 transition-[margin] duration-200 ml-16 peer-hover:ml-64">
        <Outlet context={{ setTitle } satisfies LayoutContext} />
      </main>
    </div>
  );
}
