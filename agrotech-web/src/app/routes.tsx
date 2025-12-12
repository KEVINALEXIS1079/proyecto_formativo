import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner } from "@heroui/react";

// Públicas
const LandingPage = lazy(() => import("#/modules/landing/pages/LandingPage"));
const Login = lazy(() => import("@/modules/auth").then(module => ({ default: module.Login })));
const Register = lazy(() => import("@/modules/auth").then(module => ({ default: module.Register })));
const Recover = lazy(() => import("@/modules/auth").then(module => ({ default: module.Recover })));
const Code = lazy(() => import("@/modules/auth").then(module => ({ default: module.Code })));
const ChangePassword = lazy(() => import("@/modules/auth").then(module => ({ default: module.ChangePassword })));

// Layout privado
import ProtectedLayout from "@/app/layout/ProtectedLayout";

// Páginas privadas
const Home = lazy(() => import("@/modules/home/pages/HomePage"));

const ListaPage = lazy(() => import("@/modules/actividad/pages").then(m => ({ default: m.ListaPage })));
const CrearPage = lazy(() => import("@/modules/actividad/pages").then(m => ({ default: m.CrearPage })));
const EditarPage = lazy(() => import("@/modules/actividad/pages").then(m => ({ default: m.EditarPage })));

const UsersPage = lazy(() => import("@/modules/users/pages/UsersPage").then(m => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import("@/modules/users/pages/RolesPage"));

const CultivosListPage = lazy(() => import("@/modules/cultivos/pages/indexPageCultivos").then(m => ({ default: m.CultivosListPage })));
const CultivoCreatePage = lazy(() => import("@/modules/cultivos/pages/indexPageCultivos").then(m => ({ default: m.CultivoCreatePage })));
const CultivoEditPage = lazy(() => import("@/modules/cultivos/pages/indexPageCultivos").then(m => ({ default: m.CultivoEditPage })));
const CultivoDetailPage = lazy(() => import("@/modules/cultivos/pages/indexPageCultivos").then(m => ({ default: m.CultivoDetailPage })));

// COMERCIAL (Antes Finanzas)
const ComercialPage = lazy(() => import("@/modules/comercial/pages/ComercialPage"));

const PageReportes = lazy(() => import("@/modules/reportes/pages/indexPageReportes").then(m => ({ default: m.PageReportes })));
const ListaPageReporte = lazy(() => import("@/modules/reportes/pages/indexPageReportes").then(m => ({ default: m.ListaPageReporte })));
const CrearPageReporte = lazy(() => import("@/modules/reportes/pages/indexPageReportes").then(m => ({ default: m.CrearPageReporte })));
const EditarPageReporte = lazy(() => import("@/modules/reportes/pages/indexPageReportes").then(m => ({ default: m.EditarPageReporte })));
const ReporteCultivoPage = lazy(() => import("@/modules/reportes/pages/indexPageReportes").then(m => ({ default: m.ReporteCultivoPage })));
const ReporteLotePage = lazy(() => import("@/modules/reportes/pages/indexPageReportes").then(m => ({ default: m.ReporteLotePage })));

const IoTPage = lazy(() => import("@/modules/iot/pages/IoTPage"));
const IoTDashboard = lazy(() => import("@/modules/iot/pages/IoTDashboard").then(m => ({ default: m.IoTDashboard })));
const LotsAnalyticsPage = lazy(() => import("@/modules/iot/pages/LotsAnalyticsPage").then(m => ({ default: m.LotsAnalyticsPage })));

const ProfilePage = lazy(() => import("@/modules/profile/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));

const EpaListPage = lazy(() => import("@/modules/fitosanitario/pages").then(m => ({ default: m.EpaListPage })));
const EpaCreatePage = lazy(() => import("@/modules/fitosanitario/pages").then(m => ({ default: m.EpaCreatePage })));
const EpaEditPage = lazy(() => import("@/modules/fitosanitario/pages").then(m => ({ default: m.EpaEditPage })));
const EpaDetailPage = lazy(() => import("@/modules/fitosanitario/pages").then(m => ({ default: m.EpaDetailPage })));
const TipoEpaPage = lazy(() => import("@/modules/fitosanitario/pages").then(m => ({ default: m.TipoEpaPage })));
const TipoCultivoEpaPage = lazy(() => import("@/modules/fitosanitario/pages").then(m => ({ default: m.TipoCultivoEpaPage })));

const InventarioPage = lazy(() => import("@/modules/inventario/pages/InventarioPage"));
const CrearInsumoPage = lazy(() => import("@/modules/inventario/pages/CrearInsumoPage"));
const EditarInsumoPage = lazy(() => import("@/modules/inventario/pages/EditarInsumoPage"));
const DetalleInsumoPage = lazy(() => import("@/modules/inventario/pages/DetalleInsumoPage"));
const CategoriasPage = lazy(() => import("@/modules/inventario/pages/CategoriasPage"));
const ProveedoresPage = lazy(() => import("@/modules/inventario/pages/ProveedoresPage"));
const AlmacenesPage = lazy(() => import("@/modules/inventario/pages/AlmacenesPage"));
const InsumosEliminadosPage = lazy(() => import("@/modules/inventario/pages/InsumosEliminadosPage"));
const HistorialMovimientosPage = lazy(() => import("@/modules/inventario/pages/HistorialMovimientosPage"));

const GeoPage = lazy(() => import("@/modules/geo/pages/GeoPage"));
const ProductionPage = lazy(() => import("@/modules/production/pages/ProductionPage"));

// Guards
import { ProtectedRoute } from "@/modules/auth/ui/ProtectedRoute";
import {
  PublicOnlyRoute,
  RequireRecoveryEmail,
  RequireRecoveryCode,
} from "@/app/guards";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
    <Spinner size="lg" color="primary" label="Cargando..." />
  </div>
);

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  );
}
