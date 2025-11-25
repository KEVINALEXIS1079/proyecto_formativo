import {useMemo, useState, type ReactNode} from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Chip, Divider, Input, Select, SelectItem,
  Tabs, Tab, Checkbox, Tooltip, Switch, Spinner
} from "@heroui/react";
import {
  ShieldCheck, Settings2, Search, Info, LockKeyhole,
  UserCog, Users, Sprout, Boxes, Cpu, FileBarChart
} from "lucide-react";
import {
  useRolesActivos,
  usePermisoModules,
  usePermisosRoleSelection,
  useTogglePermisoOnRole,
  type PermisoSel,
} from "../hooks/usePermisos";

type UiModule = { key: string; name: string; icon: ReactNode; color: string; id?: number };

const STATIC_MODULE_ICONS: Record<string, UiModule> = {
  usuarios: { key: "usuarios", name: "Usuarios", icon: <Users className="h-4 w-4"/>, color: "bg-blue-600" },
  cultivos: { key: "cultivos", name: "Cultivos", icon: <Sprout className="h-4 w-4"/>, color: "bg-emerald-600" },
  insumos:  { key: "insumos",  name: "Insumos",  icon: <Boxes  className="h-4 w-4"/>, color: "bg-amber-600" },
  sensores: { key: "sensores", name: "Sensores", icon: <Cpu    className="h-4 w-4"/>, color: "bg-purple-600" },
  reportes: { key: "reportes", name: "Reportes", icon: <FileBarChart className="h-4 w-4"/>, color: "bg-rose-600" },
};

export default function PermisosCheckPage() {
  // 1) Cargar roles y módulos
  const { roles } = useRolesActivos();
  const modulesQ = usePermisoModules();

  // selección local
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");

  // 2) Leer permisos del rol seleccionado (por módulo)
  const selQ = usePermisosRoleSelection(roleId, moduleId);

  // 3) Mutación toggle permisos
  const toggleMut = useTogglePermisoOnRole();

  // roles normalizados para el Select
  const roleItems = useMemo(() => {
    const items = roles.data ?? [];
    return items.map((r) => ({ id: r.id, nombre: r.nombre }));
  }, [roles.data]);

  // módulos UI (mezcla de nombres del backend con íconos/base por key)
  const uiModules: UiModule[] = useMemo(() => {
    const list = modulesQ.data?.map((m) => {
      const key = (m.nombre || "").toLowerCase();
      const base = STATIC_MODULE_ICONS[key];
      return {
        key: key || String(m.id),
        name: m.nombre || base?.name || `Módulo ${m.id}`,
        icon: base?.icon ?? <Boxes className="h-4 w-4"/>,
        color: base?.color ?? "bg-default-600",
        id: m.id,
      } as UiModule;
    }) ?? [];
    return list.length ? list : Object.values(STATIC_MODULE_ICONS);
  }, [modulesQ.data]);

  // permisos filtrados por búsqueda
  const filteredPerms: PermisoSel[] = useMemo(() => {
    const perms = selQ.data?.permisos ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return perms;
    return perms.filter(p => p.nombre.toLowerCase().includes(q));
  }, [selQ.data?.permisos, search]);

  const loadingAny = roles.isLoading || modulesQ.isLoading || (roleId ? selQ.isLoading : false);

  const onToggle = (perm: PermisoSel, enable: boolean) => {
    if (!roleId) return;
    // `nombre` podría ser "modulo:accion" — si tu backend requiere id, ya viene en perm.id
    toggleMut.mutate({ roleId, permisoId: perm.id, enable, moduleId });
  };

  // bulk (activar todos los visibles)
  const onToggleAllVisible = (enable: boolean) => {
    if (!roleId || !filteredPerms.length) return;
    const pendings = filteredPerms.filter(p => p.selected !== enable);
    pendings.forEach(p =>
      toggleMut.mutate({ roleId, permisoId: p.id, enable, moduleId })
    );
  };

  return (
    <div className="min-h-dvh bg-content1/40">
      {/* top bar */}
      <div className="sticky top-0 z-30 border-b border-divider/60 backdrop-blur-md bg-background/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5"/>
            <h1 className="text-lg font-semibold tracking-tight">Permisos por Rol</h1>
            <Chip
              size="sm"
              startContent={<LockKeyhole className="h-3.5 w-3.5"/>}
              className="bg-foreground text-background"
            >
              Cambios en vivo
            </Chip>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Input
              aria-label="Buscar permiso"
              placeholder="Buscar permiso..."
              classNames={{
                inputWrapper: "bg-content2/60 data-[hover=true]:bg-content2/80 data-[focus=true]:bg-content2/80",
              }}
              startContent={<Search className="h-4 w-4"/>}
              variant="bordered"
              size="sm"
              value={search}
              onValueChange={setSearch}
              isDisabled={!roleId}
            />

            {/* Select Rol */}
            <Select
              aria-label="Rol"
              size="sm"
              className="w-56"
              startContent={<UserCog className="h-4 w-4"/>}
              selectedKeys={roleId ? new Set([String(roleId)]) : new Set([])}
              onChange={(e) => {
                const v = Number(e.target.value);
                setRoleId(Number.isFinite(v) ? v : undefined);
              }}
              placeholder="Selecciona un rol"
              isLoading={roles.isLoading}
            >
                {roleItems.map(r => (
                  <SelectItem key={String(r.id)} textValue={r.nombre}>
                    {r.nombre}
                  </SelectItem>
                ))}
            </Select>

            {/* Select Módulo (opcional) */}
            <Select
              aria-label="Módulo"
              size="sm"
              className="w-48"
              selectedKeys={moduleId ? new Set([String(moduleId)]) : new Set([])}
              onChange={(e) => {
                const v = Number(e.target.value);
                setModuleId(Number.isFinite(v) ? v : undefined);
              }}
              placeholder="Todos los módulos"
              isDisabled={!roleId}
              isLoading={modulesQ.isLoading}
            >
              {uiModules.map(m => (
                <SelectItem key={String(m.id ?? m.key)} textValue={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </Select>

            <Tooltip content="Opciones de visualización">
              <Button isIconOnly variant="flat" size="sm">
                <Settings2 className="h-4 w-4"/>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* contenido */}
      <main className="mx-auto max-w-7xl px-4 py-6 grid gap-6">
        <Card shadow="sm">
          <CardHeader className="flex gap-2 items-start">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-default-500"/>
              <div>
                <p className="text-small text-default-500">
                  Marca o desmarca permisos del rol seleccionado. Los cambios se aplican en tiempo real.
                </p>
                <p className="text-tiny text-default-400">
                  Puedes filtrar por módulo y buscar por nombre del permiso.
                </p>
              </div>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody className="grid gap-6">
            {loadingAny && (
              <div className="w-full py-10 grid place-items-center">
                <Spinner label="Cargando permisos..."/>
              </div>
            )}

            {!loadingAny && !roleId && (
              <EmptyHint text="Selecciona un rol para visualizar sus permisos."/>
            )}

            {!loadingAny && roleId && filteredPerms.length === 0 && (
              <EmptyHint text="No hay permisos para mostrar con los filtros actuales."/>
            )}

            {!loadingAny && roleId && filteredPerms.length > 0 && (
              <Tabs aria-label="Agrupación de permisos" color="primary" variant="underlined">
                {/* Tab única “Permisos” (puedes dividir en Básicos/Avanzados si tu backend distingue) */}
                <Tab key="all" title="Permisos">
                  <PermsGrid
                    perms={filteredPerms}
                    onToggle={onToggle}
                    busy={toggleMut.isPending}
                    header={
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="text-tiny text-default-500">Todo</span>
                          <Switch size="sm"
                                  isSelected={filteredPerms.every(p => p.selected)}
                                  onValueChange={(v) => onToggleAllVisible(v)}
                                  aria-label="Activar todos"/>
                        </div>
                        <Chip size="sm" variant="flat" color="primary">
                          {filteredPerms.filter(p => p.selected).length} / {filteredPerms.length} activos
                        </Chip>
                      </div>
                    }
                  />
                </Tab>
              </Tabs>
            )}
          </CardBody>
          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-tiny text-default-500">
              <span>Estado:</span>
              <Chip size="sm" variant="flat" color={toggleMut.isPending ? "warning" : "success"}>
                {toggleMut.isPending ? "Aplicando cambios..." : "Sin cambios pendientes"}
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="flat" onPress={() => setSearch("")} isDisabled={!search}>
                Reiniciar búsqueda
              </Button>
              <Button color="primary" isDisabled>
                Guardar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

function PermsGrid({
  perms,
  onToggle,
  busy,
  header,
}: {
  perms: PermisoSel[];
  onToggle: (perm: PermisoSel, enable: boolean) => void;
  busy?: boolean;
  header?: React.ReactNode;
}) {
  // map icons/colors heurísticos según "modulo:accion" dentro de nombre si lo trae así
  return (
    <Card shadow="sm" className="border border-divider/60">
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary text-white shadow">
            <ShieldCheck className="h-4 w-4"/>
          </div>
          <div>
            <h3 className="text-medium font-semibold leading-none">Permisos</h3>
            <p className="text-tiny text-default-500">Acciones disponibles</p>
          </div>
        </div>
        {header}
      </CardHeader>
      <Divider/>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {perms.map((p) => (
            <Checkbox
              key={p.id}
              isSelected={p.selected}
              onValueChange={(v) => onToggle(p, v)}
              isDisabled={busy}
              classNames={{
                base: "px-3 py-2 rounded-xl border border-divider/60 bg-content2/40 hover:bg-content2/60 transition-colors",
              }}
            >
              <span className="font-medium">{p.nombre}</span>
            </Checkbox>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function EmptyHint({text}: {text: string}) {
  return (
    <div className="w-full py-10 grid place-items-center text-default-500">
      {text}
    </div>
  );
}
