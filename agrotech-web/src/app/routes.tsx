import { Routes, Route, Navigate } from "react-router-dom";

// Públicas
import LandingPage from "#/modules/landing/pages/LandingPage";
import { Login, Register, Recover, Code, ChangePassword } from "@/modules/auth";

// Layout privado
import ProtectedLayout from "@/app/layout/ProtectedLayout";

// Páginas privadas
import Home from "@/modules/landing/pages/HomePage";

import { ActividadesListPage, ActividadEditPage, ActividadDetailPage } from "@/modules/actividades/pages";
import ActividadCreatePage from "@/modules/actividades/pages/ActividadCreatePage";

import { UsersPage } from "@/modules/users/pages/UsersPage";

import { CultivosListPage, CultivoCreatePage, CultivoEditPage, CultivoDetailPage } from "@/modules/cultivos/pages/indexPageCultivos";

import { EpaListPage, EpaCreatePage, EpaEditPage, EpaDetailPage, TipoEpaPage, TipoCultivoEpaPage } from "@/modules/fitosanitario/pages";

import { FinanzasPage, ListaPageFinanzas, CrearPageFinanzas, EditarPageFinanzas } from "@/modules/finanzas/pages/indexPageFinanzas";
import VentasListPage from "@/modules/finanzas/pages/VentasListPage";
import VentaCreatePage from "@/modules/finanzas/pages/VentaCreatePage";
import VentaDetailPage from "@/modules/finanzas/pages/VentaDetailPage";

import { PageReportes, ListaPageReporte, CrearPageReporte, EditarPageReporte, ReporteCultivoPage, ReporteLotePage } from "@/modules/reportes/pages/indexPageReportes";

import {SensoresLivePage} from "@/modules/iot/Sensor/pages/indexPageIot";
import  TipoSensorPage from "@/modules/iot/TipoSensor/pages/indexPageTipoSensor";

import  CrearPageTipoCultivo  from "@/modules/cultivo/tipoCultivo/pages/crearPage";

import {CrearPageSublote, ListaPageSublote, EditarPageSublote} from "@/modules/cultivo/sublote/pages/IndexPageSublote";

import {CrearPageLote, ListaPageLote, EditarPageLote} from "@/modules/cultivo/lote/pages/indexPageLote";

import { ProfilePage } from "@/modules/profile/pages/ProfilePage";

import InventarioPage from "@/modules/inventario/pages/InventarioPage";
import CrearInsumoPage from "@/modules/inventario/pages/CrearInsumoPage";
import EditarInsumoPage from "@/modules/inventario/pages/EditarInsumoPage";
import DetalleInsumoPage from "@/modules/inventario/pages/DetalleInsumoPage";
import CategoriasPage from "@/modules/inventario/pages/CategoriasPage";
import ProveedoresPage from "@/modules/inventario/pages/ProveedoresPage";
import AlmacenesPage from "@/modules/inventario/pages/AlmacenesPage";
import InsumosEliminadosPage from "@/modules/inventario/pages/InsumosEliminadosPage";
import HistorialMovimientosPage from "@/modules/inventario/pages/HistorialMovimientosPage";

// Guards
import { ProtectedRoute } from "@/modules/auth/ui/ProtectedRoute";
import {
  PublicOnlyRoute,
  RequireRecoveryEmail,
  RequireRecoveryCode,
} from "@/app/guards";
import { useAuth } from "@/modules/auth/hooks/useAuth";


export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Raíz */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/start"} replace />}
      />

      {/* ===== Públicas ===== */}
      <Route
        path="/start"
        element={
          <PublicOnlyRoute>
            <LandingPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/recover"
        element={
          <PublicOnlyRoute>
            <Recover />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/code"
        element={
          <PublicOnlyRoute>
            <RequireRecoveryEmail>
              <Code />
            </RequireRecoveryEmail>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <PublicOnlyRoute>
            <RequireRecoveryCode>
              <ChangePassword />
            </RequireRecoveryCode>
          </PublicOnlyRoute>
        }
      />

      {/* ===== Privadas ===== */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Actividades */}
        <Route path="/actividades" element={<ActividadesListPage />} />
        <Route path="/actividades/crear" element={<ActividadCreatePage />} />
        <Route path="/actividades/:id" element={<ActividadDetailPage />} />
        <Route path="/actividades/:id/editar" element={<ActividadEditPage />} />

        {/* Cultivos */}
        <Route path="/cultivos/crear" element={<CultivoCreatePage />} />
        <Route path="/cultivos/editar/:id" element={<CultivoEditPage />} />
        <Route path="/cultivos/detalle/:id" element={<CultivoDetailPage />} />
        <Route path="/tipo-cultivo/crear" element={<CrearPageTipoCultivo />} />
        
        {/* Lotes */}
        <Route path="/lotes/crear" element={<CrearPageLote />} />
        <Route path="/lotes/listar" element={<ListaPageLote />} />
        <Route path="/lotes/editar/:id_lote" element={< EditarPageLote/>} />

        {/* Sublotes */}
        <Route path="/sublotes/crear" element={<CrearPageSublote />} />
        <Route path="/sublotes/listar" element={< ListaPageSublote/>} />
        <Route path="/sublotes/editar/:id_sublote" element={< EditarPageSublote/>} />

        {/* Fitosanitario */}
        <Route path="/fitosanitario" element={<EpaListPage />} />
        <Route path="/fitosanitario/crear" element={<EpaCreatePage />} />
        <Route path="/fitosanitario/:id" element={<EpaDetailPage />} />
        <Route path="/fitosanitario/:id/editar" element={<EpaEditPage />} />
        <Route path="/fitosanitario/tipos" element={<TipoEpaPage />} />
        <Route path="/fitosanitario/tipo-cultivos" element={<TipoCultivoEpaPage />} />

        {/* Finanzas */}
        <Route path="/finanzas" element={<FinanzasPage />} />
        <Route path="/lista-finanzas" element={<ListaPageFinanzas />} />
        <Route path="/crear-finanzas" element={<CrearPageFinanzas />} />
        <Route path="/editar-finanzas" element={<EditarPageFinanzas />} />
        <Route path="/finanzas/ventas" element={<VentasListPage />} />
        <Route path="/finanzas/ventas/crear" element={<VentaCreatePage />} />
        <Route path="/finanzas/ventas/:id" element={<VentaDetailPage />} />

        {/* Inventario */}
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/inventario/crear" element={<CrearInsumoPage />} />
        <Route path="/inventario/:id" element={<DetalleInsumoPage />} />
        <Route path="/inventario/:id/editar" element={<EditarInsumoPage />} />
        <Route path="/inventario/categorias" element={<CategoriasPage />} />
        <Route path="/inventario/proveedores" element={<ProveedoresPage />} />
        <Route path="/inventario/almacenes" element={<AlmacenesPage />} />
        <Route path="/inventario/insumos-eliminados" element={<InsumosEliminadosPage />} />
        <Route path="/inventario/historial-movimientos" element={<HistorialMovimientosPage />} />

        {/* Reportes */}
        <Route path="/reportes" element={<PageReportes />} />
        <Route path="/lista-reportes" element={<ListaPageReporte />} />
        <Route path="/crear-reporte" element={<CrearPageReporte />} />
        <Route path="/editar-reporte" element={<EditarPageReporte />} />
        <Route path="/reportes/cultivo" element={<ReporteCultivoPage />} />
        <Route path="/reportes/lote" element={<ReporteLotePage />} />

        {/* Usuarios */}
        <Route path="/usuarios" element={<UsersPage />} />

        {/* Perfil */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* IoT */}
        <Route path="/SensoresLivePage" element={<SensoresLivePage />} />
        <Route path="/TipoSensorPage" element={<TipoSensorPage />} />

      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/start" replace />} />
    </Routes>
  );
}