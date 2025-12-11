import { Routes, Route, Navigate } from "react-router-dom";

// Públicas
import LandingPage from "#/modules/landing/pages/LandingPage";
import { Login, Register, Recover, Code, ChangePassword } from "@/modules/auth";

// Layout privado
import ProtectedLayout from "@/app/layout/ProtectedLayout";

// Páginas privadas
import Home from "@/modules/home/pages/HomePage";

import { ListaPage, CrearPage, EditarPage } from "@/modules/actividad/pages";

import { UsersPage } from "@/modules/users/pages/UsersPage";
import RolesPage from "@/modules/users/pages/RolesPage";

import {
  CultivosListPage,
  CultivoCreatePage,
  CultivoEditPage,
  CultivoDetailPage,
} from "@/modules/cultivos/pages/indexPageCultivos";

// COMERCIAL (Antes Finanzas)
import ComercialPage from "@/modules/comercial/pages/ComercialPage";

import {
  PageReportes,
  ListaPageReporte,
  CrearPageReporte,
  EditarPageReporte,
  ReporteCultivoPage,
  ReporteLotePage,
} from "@/modules/reportes/pages/indexPageReportes";

import IoTPage from "@/modules/iot/pages/IoTPage";
import { IoTDashboard } from "@/modules/iot/pages/IoTDashboard";
import { LotsAnalyticsPage } from "@/modules/iot/pages/LotsAnalyticsPage";

import { ProfilePage } from "@/modules/profile/pages/ProfilePage";

import { EpaListPage, EpaCreatePage, EpaEditPage, EpaDetailPage, TipoEpaPage, TipoCultivoEpaPage } from "@/modules/fitosanitario/pages";

import InventarioPage from "@/modules/inventario/pages/InventarioPage";
import CrearInsumoPage from "@/modules/inventario/pages/CrearInsumoPage";
import EditarInsumoPage from "@/modules/inventario/pages/EditarInsumoPage";
import DetalleInsumoPage from "@/modules/inventario/pages/DetalleInsumoPage";
import CategoriasPage from "@/modules/inventario/pages/CategoriasPage";
import ProveedoresPage from "@/modules/inventario/pages/ProveedoresPage";
import AlmacenesPage from "@/modules/inventario/pages/AlmacenesPage";
import InsumosEliminadosPage from "@/modules/inventario/pages/InsumosEliminadosPage";
import HistorialMovimientosPage from "@/modules/inventario/pages/HistorialMovimientosPage";

import GeoPage from "@/modules/geo/pages/GeoPage";
import ProductionPage from "@/modules/production/pages/ProductionPage";

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
        <Route path="/actividades" element={<ListaPage />} />
        <Route path="/actividades/crear" element={<CrearPage />} />
        {/* <Route path="/actividades/:id" element={<ActividadDetailPage />} /> */}
        <Route path="/actividades/:id/editar" element={<EditarPage />} />

        {/* Cultivos */}
        <Route path="/cultivos/crear" element={<CultivoCreatePage />} />
        <Route path="/cultivos" element={<CultivosListPage />} />
        <Route path="/cultivos/editar/:id" element={<CultivoEditPage />} />
        <Route path="/cultivos/detalle/:id" element={<CultivoDetailPage />} />
        {/* <Route path="/tipo-cultivo/crear" element={<CrearPageTipoCultivo />} /> */}

        {/* Fitosanitario */}
        <Route path="/fitosanitario" element={<EpaListPage />} />
        <Route path="/fitosanitario/crear" element={<EpaCreatePage />} />
        <Route path="/fitosanitario/:id" element={<EpaDetailPage />} />
        <Route path="/fitosanitario/:id/editar" element={<EpaEditPage />} />
        <Route path="/fitosanitario/tipos" element={<TipoEpaPage />} />
        <Route
          path="/fitosanitario/tipo-cultivos"
          element={<TipoCultivoEpaPage />}
        />

        {/* Comercial (Antes Finanzas) - Unified Module */}
        <Route path="/comercial" element={<ComercialPage />} />
        {/* Redirect old routes */}
        <Route path="/finanzas/*" element={<Navigate to="/comercial" replace />} />
        <Route path="/lotes/*" element={<Navigate to="/comercial" replace />} />

        {/* Inventario */}
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/inventario/crear" element={<CrearInsumoPage />} />
        <Route path="/inventario/:id" element={<DetalleInsumoPage />} />
        <Route path="/inventario/:id/editar" element={<EditarInsumoPage />} />
        <Route path="/inventario/categorias" element={<CategoriasPage />} />
        <Route path="/inventario/proveedores" element={<ProveedoresPage />} />
        <Route path="/inventario/almacenes" element={<AlmacenesPage />} />
        <Route
          path="/inventario/insumos-eliminados"
          element={<InsumosEliminadosPage />}
        />
        <Route
          path="/inventario/historial-movimientos"
          element={<HistorialMovimientosPage />}
        />

        {/* Reportes */}
        <Route path="/reportes" element={<PageReportes />} />
        <Route path="/lista-reportes" element={<ListaPageReporte />} />
        <Route path="/crear-reporte" element={<CrearPageReporte />} />
        <Route path="/editar-reporte" element={<EditarPageReporte />} />
        <Route path="/reportes/cultivo" element={<ReporteCultivoPage />} />
        <Route path="/reportes/lote" element={<ReporteLotePage />} />

        {/* Usuarios */}
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/usuarios/roles" element={<RolesPage />} />

        {/* Perfil */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* IoT */}
        <Route path="/iot" element={<IoTPage />}>
          <Route index element={<IoTDashboard />} />
          <Route path="analytics" element={<LotsAnalyticsPage />} />
        </Route>

        {/* Producción */}
        <Route path="/production" element={<ProductionPage />} />

        {/* Geo */}
        <Route path="/geo" element={<GeoPage />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/start" replace />} />
    </Routes>
  );
}
