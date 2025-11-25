import  { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePerfil } from "../../modules/usuarios/perfil/hooks/usePerfil";
import Sidebar from "./components/Sidebar";
import ProtectedHeader from "./components/ProtectedHeader";

export type LayoutContext = { setTitle: (t: string) => void };

export default function ProtectedLayout() {
  const [title, setTitle] = useState("Inicio");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { me, loading } = usePerfil();
  const user = me ? {
    name: `${me.nombre} ${me.apellido}`,
    email: me.correo,
    role: me.rol?.nombre ?? "Sin rol",
    avatarUrl: me.avatar ?? "",
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
        loading={loading}
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
