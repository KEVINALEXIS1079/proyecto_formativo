// src/modules/insumos/features/InsumosDemo.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardBody, Button, Select, SelectItem, Input, Divider,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Pagination, Textarea, Tabs, Tab, Chip
} from "@heroui/react";
import {
  Plus, Eye, Pencil, Trash2, Settings, Search, Package, Image as ImageIcon,
  ListFilter, ArrowDownCircle, ArrowUpCircle
} from "lucide-react";

/* ===================== Tipos ===================== */
type EstadoInsumo =
  | "Activo" | "Inactivo" | "Obsoleto" | "Espera"
  | "Dañado" | "Reservado" | "Bajo stock" | "Medio stock";

type Proveedor = {
  id: string;
  nombre_proveedor: string;
  direccion_proveedor?: string;
  email_proveedor?: string;
  telefono_proveedor?: string;
};

type Almacen = { id: string; nombre_almacen: string };

type Categoria = {
  id: string;
  nombre_categoria: string;
  descripcion_categoria?: string;
};

// MODELO al estilo back: base (kg/L) + pack (tamaño por unidad)
type Insumo = {
  id_insumo_pk: string;
  nombre: string;
  tipo: string;

  // Unidades y presentación
  unidad_medida: string;          // base: "kg", "L"
  cantidad_por_unidad: number;    // tamaño del empaque (p.ej. 50 si es Bulto 50 kg)
  presentacion?: string;          // etiqueta bonita (opcional)

  // Stock (fuente de verdad)
  stock_base: number;             // SIEMPRE en base (kg/L)

  // Precio por unidad de venta (bulto/galón/saco)
  costo: number;

  // Otros
  estado_insumo: EstadoInsumo;
  fecha_ingreso: string;
  fecha_salida?: string;
  fecha_vencimiento?: string;
  proveedorId?: string;
  almacenId?: string;
  categoriaId?: string;
  img_url?: string;
  descripcion?: string;
};

type TipoMov = "entrada" | "salida";
type MotivoMov = "compra" | "consumo_actividad" | "devolucion" | "merma" | "ajuste_manual";

type Movimiento = {
  id: string;
  id_insumo: string;
  tipo: TipoMov;
  motivo: MotivoMov;
  // cantidad: para mostrar ambos mundos (unidades y base) sin perder info
  cantidad?: number;        // en unidades de venta (bultos/galones)
  cantidad_base: number;    // en base (kg/L)
  valor_movimiento?: number; // +entrada / -salida (en $ por unidades)
  fecha: string;             // YYYY-MM-DD
  id_proveedor?: string;
  id_almacen: string;
  responsable?: string;
  observacion?: string;      // para ajustes/manuales
  // Datos de actividad para salidas:
  actividad_nombre?: string;
  actividad_encargado?: string;
  actividad_categoria?: string;
};

/* ===================== Utilidades ===================== */
function pad(n: number) { return n.toString().padStart(2, "0"); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function datePlus(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ===================== Catálogos (mock) ===================== */
const ESTADOS: EstadoInsumo[] = [
  "Activo","Inactivo","Obsoleto","Espera","Dañado","Reservado","Bajo stock","Medio stock"
];

const PROVEEDORES_MOCK: Proveedor[] = [
  { id: "p1", nombre_proveedor: "Yara Colombia", email_proveedor: "info@yara.com.co", telefono_proveedor: "6017421234", direccion_proveedor: "Bogotá, D.C." },
  { id: "p2", nombre_proveedor: "Monómeros", email_proveedor: "contacto@monomeros.com.co", telefono_proveedor: "6053855000", direccion_proveedor: "Barranquilla" },
  { id: "p3", nombre_proveedor: "Agrocampo", email_proveedor: "ventas@agrocampo.com.co", telefono_proveedor: "6013693399", direccion_proveedor: "Bogotá, D.C." },
  { id: "p4", nombre_proveedor: "Disagro Colombia", email_proveedor: "comercial@disagro.co", telefono_proveedor: "6025557711", direccion_proveedor: "Cali" },
];

const ALMACENES_MOCK: Almacen[] = [
  { id: "a1", nombre_almacen: "Principal" },
  { id: "a2", nombre_almacen: "Bodega Norte" },
  { id: "a3", nombre_almacen: "Secundario" },
];

const CATEGORIAS_MOCK: Categoria[] = [
  { id: "c1", nombre_categoria: "Fertilizantes", descripcion_categoria: "Urea, DAP, KCl, NPK" },
  { id: "c2", nombre_categoria: "Herbicidas", descripcion_categoria: "Glifosato, 2,4-D, Atrazina" },
  { id: "c3", nombre_categoria: "Insecticidas", descripcion_categoria: "Clorpirifos, Imidacloprid" },
  { id: "c4", nombre_categoria: "Fungicidas", descripcion_categoria: "Mancozeb, Azoxistrobina" },
  { id: "c5", nombre_categoria: "Bioinsumos", descripcion_categoria: "Trichoderma, Bacillus" },
  { id: "c6", nombre_categoria: "Semillas", descripcion_categoria: "Maíz, Fríjol, Pastos" },
  { id: "c7", nombre_categoria: "Enmiendas/Cal", descripcion_categoria: "Cal agrícola, yeso" },
  { id: "c8", nombre_categoria: "Riego", descripcion_categoria: "Mangueras, aspersores" },
  { id: "c9", nombre_categoria: "Herramientas", descripcion_categoria: "Palas, bombas de espalda" },
  { id: "c10", nombre_categoria: "Postcosecha/Empaques", descripcion_categoria: "Guacales, costales" },
];

/* ===================== Mock de Insumos ===================== */
function makeMockInsumos(n = 28): Insumo[] {
  const items = [
    { nombre: "Urea 46%", tipo: "fertilizante", unidad: "kg", present: "Bulto 50 kg", pack: 50, cat: "c1" },
    { nombre: "DAP 18-46-0", tipo: "fertilizante", unidad: "kg", present: "Bulto 50 kg", pack: 50, cat: "c1" },
    { nombre: "KCl 60%", tipo: "fertilizante", unidad: "kg", present: "Bulto 50 kg", pack: 50, cat: "c1" },
    { nombre: "Glifosato 480 SL", tipo: "herbicida", unidad: "L", present: "Galón 3.785 L", pack: 3.785, cat: "c2" },
    { nombre: "2,4-D Amina", tipo: "herbicida", unidad: "L", present: "Galón 3.785 L", pack: 3.785, cat: "c2" },
    { nombre: "Clorpirifos 480 EC", tipo: "insecticida", unidad: "L", present: "Botella 1 L", pack: 1, cat: "c3" },
    { nombre: "Imidacloprid 350 SC", tipo: "insecticida", unidad: "L", present: "Botella 1 L", pack: 1, cat: "c3" },
    { nombre: "Mancozeb 80 WP", tipo: "fungicida", unidad: "kg", present: "Bulto 25 kg", pack: 25, cat: "c4" },
    { nombre: "Azoxistrobina 250 SC", tipo: "fungicida", unidad: "L", present: "Botella 1 L", pack: 1, cat: "c4" },
    { nombre: "Semilla Maíz ICA V-305", tipo: "semilla", unidad: "kg", present: "Saco 25 kg", pack: 25, cat: "c6" },
  ];

  const res: Insumo[] = [];
  for (let i = 0; i < n; i++) {
    const base = items[i % items.length];
    // stock_base = unidades * pack + suelto
    const unidades = Math.floor(Math.random() * 30) + 10; // 10..39
    const suelto = Math.random() > 0.7 ? Math.floor(Math.random() * base.pack) : 0;
    const stock_base = unidades * base.pack + suelto;

    res.push({
      id_insumo_pk: `i${i+1}`,
      nombre: `${base.nombre} ${i+1}`,
      tipo: base.tipo,
      unidad_medida: base.unidad,
      cantidad_por_unidad: base.pack,
      presentacion: base.present,
      stock_base,
      costo: Math.floor(Math.random() * 90000) + 20000, // $ por unidad de venta
      estado_insumo: "Activo",
      fecha_ingreso: datePlus(-Math.floor(Math.random()*90)),
      fecha_vencimiento: Math.random() > 0.5 ? datePlus(Math.floor(Math.random()*360)+30) : undefined,
      proveedorId: rand(PROVEEDORES_MOCK).id,
      almacenId: rand(ALMACENES_MOCK).id,
      categoriaId: base.cat,
      img_url: "",
      descripcion: "Lote demo Colombia",
    });
  }
  return res;
}

/* ===================== Mock de Movimientos ===================== */
function makeMockMovs(insumos: Insumo[]): Movimiento[] {
  const res: Movimiento[] = [];
  for (let k=0;k<40;k++){
    const i = rand(insumos);
    const tipo: TipoMov = Math.random() > 0.45 ? "salida" : "entrada";
    if (tipo === "entrada") {
      const u = Math.floor(Math.random()*10)+1;          // unidades de venta
      const base = +(u * i.cantidad_por_unidad).toFixed(3);
      res.push({
        id: `m${Date.now()}-${k}`,
        id_insumo: i.id_insumo_pk,
        tipo: "entrada",
        motivo: "compra",
        cantidad: u,
        cantidad_base: base,
        valor_movimiento: u * (i.costo || 0),
        fecha: datePlus(-Math.floor(Math.random()*120)),
        id_proveedor: i.proveedorId,
        id_almacen: i.almacenId || "a1",
        responsable: "Sistema demo"
      });
    } else {
      const base = +(Math.random()*20 + 5).toFixed(3);   // salida en base
      res.push({
        id: `m${Date.now()}-${k}`,
        id_insumo: i.id_insumo_pk,
        tipo: "salida",
        motivo: "consumo_actividad",
        cantidad: +(base / Math.max(1, i.cantidad_por_unidad)).toFixed(3), // informativo
        cantidad_base: base,
        valor_movimiento: -((base / Math.max(1, i.cantidad_por_unidad)) * (i.costo || 0)),
        fecha: datePlus(-Math.floor(Math.random()*120)),
        id_almacen: i.almacenId || "a1",
        responsable: "Ing. Pérez",
        actividad_nombre: "Fertilización",
        actividad_encargado: "Juan Gómez",
        actividad_categoria: "Fertilizantes"
      });
    }
  }
  return res;
}

/* ===================== Helpers de stock derivado ===================== */
function splitUnidades(i: Insumo) {
  const pack = Math.max(1, i.cantidad_por_unidad || 1);
  const unidades = Math.floor(i.stock_base / pack);
  const suelto = +(i.stock_base - unidades * pack).toFixed(3);
  return { unidades, suelto, pack };
}

function unidadesLabel(i: Insumo) {
  const { unidades, suelto } = splitUnidades(i);
  return `${unidades} u + ${suelto} ${i.unidad_medida}`;
}

function packLabel(i: Insumo) {
  if (i.presentacion?.trim()) return i.presentacion!;
  return `${i.cantidad_por_unidad} ${i.unidad_medida}`;
}

/* ===================== Componente principal ===================== */
export default function InsumosDemo() {
  /* catálogos */
  const [proveedores, setProveedores] = useState<Proveedor[]>(PROVEEDORES_MOCK);
  const [almacenes, setAlmacenes]     = useState<Almacen[]>(ALMACENES_MOCK);
  const [categorias, setCategorias]   = useState<Categoria[]>(CATEGORIAS_MOCK);

  /* data */
  const [insumos, setInsumos] = useState<Insumo[]>(() => makeMockInsumos());
  const [movs, setMovs]       = useState<Movimiento[]>(() => makeMockMovs(makeMockInsumos(12)));

  /* vista activa */
  const [tab, setTab] = useState<"lista" | "historial">("lista");

  /* filtros lista */
  const [q, setQ] = useState("");
  const [fProv, setFProv] = useState<string | null>(null);
  const [fAlm,  setFAlm]  = useState<string | null>(null);
  const [fCat,  setFCat]  = useState<string | null>(null);

  /* paginación lista */
  const PER_PAGE = 20;
  const [page, setPage] = useState(1);

  /* modales */
  const [openRegistrar, setOpenRegistrar] = useState(false);
  const [openIngresar, setOpenIngresar]   = useState(false); // entrada de stock (unidades)
  const [openSalida, setOpenSalida]       = useState<Insumo | null>(null); // salida por actividad (base)
  const [openAjuste, setOpenAjuste]       = useState<Insumo | null>(null); // ajuste manual (base)
  const [openDetalle, setOpenDetalle]     = useState<Insumo | null>(null);
  const [movView, setMovView]             = useState<Movimiento | null>(null); // visor de card

  /* forms registrar/editar */
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Insumo>>({
    nombre: "", tipo: "", unidad_medida: "", presentacion: "",
    cantidad_por_unidad: 1, stock_base: 0, costo: 0, estado_insumo: "Activo", fecha_ingreso: today(),
  });

  /* form ENTRADA (unidades) */
  const [ingSelId, setIngSelId] = useState<string | null>(null);
  const [ingCantidad, setIngCantidad] = useState<number>(0); // unidades de venta
  const [ingCosto, setIngCosto] = useState<number>(0);
  const [ingAlmacen, setIngAlmacen] = useState<string | null>("a1");
  const [ingProv, setIngProv] = useState<string | null>(null);
  const [ingSearch, setIngSearch] = useState("");

  /* form SALIDA actividad (base) */
  const [salCantidad, setSalCantidad] = useState<number>(0); // en base (kg/L)
  const [salAlmacen, setSalAlmacen]   = useState<string | null>("a1");
  const [salActividad, setSalActividad] = useState({ nombre:"", encargado:"", categoria:"" });

  /* form AJUSTE manual (base) */
  const [ajCantidad, setAjCantidad] = useState<number>(0); // en base (kg/L)
  const [ajAlmacen, setAjAlmacen]   = useState<string | null>("a1");
  const [ajObs, setAjObs]           = useState<string>("");

  /* filtros historial */
  const [hInsumo, setHInsumo] = useState<string | null>(null);
  const [hTipo, setHTipo] = useState<TipoMov | "todos">("todos");
  const [hDesde, setHDesde] = useState<string | null>(null);
  const [hHasta, setHHasta] = useState<string | null>(null);

  /* managers de catálogos */
  const [openProvMgr, setOpenProvMgr] = useState(false);
  const [openAlmMgr, setOpenAlmMgr]   = useState(false);
  const [openCatMgr, setOpenCatMgr]   = useState(false);

  const resetForm = () => {
    setEditId(null);
    setForm({
      nombre: "",
      tipo: "",
      unidad_medida: "",
      presentacion: "",
      cantidad_por_unidad: 1,
      stock_base: 0,
      costo: 0,
      estado_insumo: "Activo",
      fecha_ingreso: today(),
      fecha_salida: "",
      fecha_vencimiento: "",
      proveedorId: undefined,
      almacenId: undefined,
      categoriaId: undefined,
      descripcion: "",
      img_url: "",
    });
  };

  /* helpers de nombres */
  const nombreProveedor = (id?: string) => proveedores.find(p => p.id === id)?.nombre_proveedor ?? "—";
  const nombreAlmacen   = (id?: string) => almacenes.find(a => a.id === id)?.nombre_almacen ?? "—";
  const nombreCategoria = (id?: string) => categorias.find(c => c.id === id)?.nombre_categoria ?? "—";

  /* ===================== LISTA ===================== */
  const filtered = useMemo(() => {
    let data = insumos.slice();
    if (q.trim()) {
      const s = q.toLowerCase();
      data = data.filter(d =>
        `${d.nombre} ${d.tipo} ${d.unidad_medida}`.toLowerCase().includes(s)
      );
    }
    if (fProv) data = data.filter(d => d.proveedorId === fProv);
    if (fAlm)  data = data.filter(d => d.almacenId === fAlm);
    if (fCat)  data = data.filter(d => d.categoriaId === fCat);
    return data;
  }, [insumos, q, fProv, fAlm, fCat]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  useEffect(() => { if (page > pages) setPage(pages); }, [pages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  /* ===================== CRUD Insumo (mock) ===================== */
  const onRegistrarSubmit = () => {
    if (!form.nombre || !form.tipo || !form.unidad_medida || !form.estado_insumo || !form.fecha_ingreso) return;

    if (editId) {
      setInsumos(prev => prev.map(i => i.id_insumo_pk === editId ? {
        ...i,
        ...form,
        cantidad_por_unidad: Number(form.cantidad_por_unidad ?? i.cantidad_por_unidad),
        costo: Number(form.costo ?? i.costo),
      } as Insumo : i));
    } else {
      const nuevo: Insumo = {
        id_insumo_pk: `i${Date.now()}`,
        nombre: form.nombre!, tipo: form.tipo!, unidad_medida: form.unidad_medida!,
        presentacion: form.presentacion || "",
        cantidad_por_unidad: Number(form.cantidad_por_unidad || 1),
        stock_base: Number(form.stock_base || 0), // inicia en base; normal es 0 y se ingresa por movimientos
        costo: Number(form.costo ?? 0),
        estado_insumo: (form.estado_insumo || "Activo") as EstadoInsumo,
        fecha_ingreso: form.fecha_ingreso!, fecha_salida: form.fecha_salida || undefined,
        fecha_vencimiento: form.fecha_vencimiento || undefined,
        proveedorId: form.proveedorId, almacenId: form.almacenId, categoriaId: form.categoriaId,
        descripcion: form.descripcion, img_url: form.img_url ?? "",
      };
      setInsumos(prev => [nuevo, ...prev]);
      setPage(1);
    }
    setOpenRegistrar(false);
    setEditId(null);
  };

  const onEdit = (i: Insumo) => { setEditId(i.id_insumo_pk); setForm({ ...i }); setOpenRegistrar(true); };
  const onDelete = (id: string) => { setInsumos(prev => prev.filter(i => i.id_insumo_pk !== id)); setOpenDetalle(null); };

  /* ===================== ENTRADA (Registrar stock en unidades) ===================== */
  const insumosFiltradosIngreso = useMemo(() => {
    const s = ingSearch.toLowerCase().trim();
    const base = s ? insumos.filter(i => `${i.nombre} ${i.tipo}`.toLowerCase().includes(s)) : insumos;
    return base.slice(0, 120);
  }, [ingSearch, insumos]);

  const onIngresarSubmit = () => {
    if (!ingSelId || ingCantidad <= 0) return;
    const ins = insumos.find(i => i.id_insumo_pk === ingSelId);
    if (!ins) return;

    setInsumos(prev => prev.map(i => {
      if (i.id_insumo_pk !== ingSelId) return i;
      const baseAdd = +(ingCantidad * Math.max(1, i.cantidad_por_unidad)).toFixed(3);
      return {
        ...i,
        stock_base: +(i.stock_base + baseAdd).toFixed(3),
        fecha_ingreso: today(),
        costo: ingCosto || i.costo,
        proveedorId: ingProv ?? i.proveedorId,
        almacenId: ingAlmacen ?? i.almacenId
      };
    }));

    const mov: Movimiento = {
      id: `m${Date.now()}`,
      id_insumo: ins.id_insumo_pk,
      tipo: "entrada",
      motivo: "compra",
      cantidad: ingCantidad, // unidades de venta
      cantidad_base: +(ingCantidad * Math.max(1, ins.cantidad_por_unidad)).toFixed(3),
      valor_movimiento: (ingCantidad) * (ingCosto || ins.costo),
      fecha: today(),
      id_proveedor: ingProv ?? ins.proveedorId,
      id_almacen: ingAlmacen || ins.almacenId || "a1",
      responsable: "Usuario demo"
    };
    setMovs(prev => [mov, ...prev]);

    setIngCantidad(0); setIngSelId(null); setOpenIngresar(false);
  };

  /* ===================== SALIDA por actividad (base) ===================== */
  const onSalidaSubmit = () => {
    if (!openSalida || salCantidad <= 0) return;
    const ins = openSalida;

    setInsumos(prev => prev.map(i => i.id_insumo_pk === ins.id_insumo_pk ? {
      ...i, stock_base: Math.max(0, +(i.stock_base - salCantidad).toFixed(3))
    } : i));

    const mov: Movimiento = {
      id: `m${Date.now()}`,
      id_insumo: ins.id_insumo_pk,
      tipo: "salida",
      motivo: "consumo_actividad",
      cantidad: +(salCantidad / Math.max(1, ins.cantidad_por_unidad)).toFixed(3), // info
      cantidad_base: salCantidad,
      valor_movimiento: -((salCantidad / Math.max(1, ins.cantidad_por_unidad)) * (ins.costo || 0)),
      fecha: today(),
      id_almacen: salAlmacen || ins.almacenId || "a1",
      responsable: "Usuario demo",
      actividad_nombre: salActividad.nombre || "Actividad",
      actividad_encargado: salActividad.encargado || "Encargado",
      actividad_categoria: salActividad.categoria || nombreCategoria(ins.categoriaId)
    };
    setMovs(prev => [mov, ...prev]);

    setSalCantidad(0); setOpenSalida(null);
  };

  /* ===================== AJUSTE manual (salida en base) ===================== */
  const onAjusteSubmit = () => {
    if (!openAjuste || ajCantidad <= 0) return;
    const ins = openAjuste;

    setInsumos(prev => prev.map(i => i.id_insumo_pk === ins.id_insumo_pk
      ? { ...i, stock_base: Math.max(0, +(i.stock_base - ajCantidad).toFixed(3)) }
      : i
    ));

    const mov: Movimiento = {
      id: `m${Date.now()}`,
      id_insumo: ins.id_insumo_pk,
      tipo: "salida",
      motivo: "ajuste_manual",
      cantidad: +(ajCantidad / Math.max(1, ins.cantidad_por_unidad)).toFixed(3),
      cantidad_base: ajCantidad,
      valor_movimiento: -((ajCantidad / Math.max(1, ins.cantidad_por_unidad)) * (ins.costo || 0)),
      fecha: today(),
      id_almacen: ajAlmacen || ins.almacenId || "a1",
      responsable: "Usuario demo",
      observacion: ajObs || "Ajuste por corrección"
    };
    setMovs(prev => [mov, ...prev]);

    setAjCantidad(0); setAjObs(""); setOpenAjuste(null);
  };

  /* ===================== HISTORIAL ===================== */
  const historial = useMemo(() => {
    let data = movs.slice();
    if (hInsumo) data = data.filter(m => m.id_insumo === hInsumo);
    if (hTipo !== "todos") data = data.filter(m => m.tipo === hTipo);
    if (hDesde) data = data.filter(m => m.fecha >= hDesde);
    if (hHasta) data = data.filter(m => m.fecha <= hHasta);
    data.sort((a,b) => (a.fecha < b.fecha ? 1 : -1));
    return data;
  }, [movs, hInsumo, hTipo, hDesde, hHasta]);

  const insumoById = (id: string) => insumos.find(i => i.id_insumo_pk === id);

  /* ===================== UI ===================== */
  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <Card shadow="sm" className="border border-default-200">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Insumos</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="flat" startContent={<ListFilter className="w-4 h-4" />} onPress={() => setTab("historial")}>
              Historial de movimientos
            </Button>
            <Button variant="flat" startContent={<Plus className="w-4 h-4" />} onPress={() => setOpenIngresar(true)}>
              Ingresar stock
            </Button>
            <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={() => { resetForm(); setOpenRegistrar(true); }}>
              Registrar insumo
            </Button>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-4">
          <Tabs selectedKey={tab} onSelectionChange={(k)=>setTab(k as any)} variant="underlined">
            <Tab key="lista" title="Lista de insumos">
              <ListaInsumosSection
                {...{
                  insumos: pageItems,
                  totalPages: pages,
                  page, setPage,
                  q, setQ,
                  fProv, setFProv, fAlm, setFAlm, fCat, setFCat,
                  proveedores, almacenes, categorias,
                  onVer: setOpenDetalle
                }}
                onOpenProvMgr={()=>setOpenProvMgr(true)}
                onOpenAlmMgr={()=>setOpenAlmMgr(true)}
                onOpenCatMgr={()=>setOpenCatMgr(true)}
              />
            </Tab>

            <Tab key="historial" title="Historial (kardex)">
              <HistorialSection
                movs={historial}
                buscarInsumoId={hInsumo}
                setBuscarInsumoId={setHInsumo}
                tipo={hTipo} setTipo={setHTipo}
                desde={hDesde} setDesde={setHDesde}
                hasta={hHasta} setHasta={setHHasta}
                insumos={insumos}
                nombreProveedor={nombreProveedor}
                nombreAlmacen={nombreAlmacen}
                nombreCategoria={nombreCategoria}
                insumoById={insumoById}
                setMovView={setMovView}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* ===================== Modal: Registrar / Editar ===================== */}
      <Modal isOpen={openRegistrar} onOpenChange={setOpenRegistrar} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>{editId ? "Modificar insumo" : "Registrar insumo"}</ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Nombre" value={form.nombre ?? ""} onValueChange={(v)=>setForm(f=>({...f,nombre:v}))} />
              <Input label="Tipo" value={form.tipo ?? ""} onValueChange={(v)=>setForm(f=>({...f,tipo:v}))} />
              <Input label="Unidad base (kg/L)" value={form.unidad_medida ?? ""} onValueChange={(v)=>setForm(f=>({...f,unidad_medida:v}))} />
              <Input label="Tamaño por unidad (pack)" type="number" min={0.001} value={String(form.cantidad_por_unidad ?? 1)} onValueChange={(v)=>setForm(f=>({...f,cantidad_por_unidad:Number(v||1)}))} />
              <Input label="Presentación (ej. Bulto 50 kg)" value={form.presentacion ?? ""} onValueChange={(v)=>setForm(f=>({...f,presentacion:v}))} />
              <Input label="Stock base (kg/L)" type="number" value={String(form.stock_base ?? 0)} onValueChange={(v)=>setForm(f=>({...f,stock_base:Number(v||0)}))} />
              <Input label="Costo por unidad de venta" type="number" min={0} value={String(form.costo ?? 0)} onValueChange={(v)=>setForm(f=>({...f,costo:Number(v||0)}))} />
              <Select label="Estado insumo" selectedKeys={new Set([form.estado_insumo ?? "Activo"])} onSelectionChange={(keys)=>{ const k = Array.from(keys)[0] as EstadoInsumo|undefined; if(k) setForm(f=>({...f,estado_insumo:k})); }}>
                {ESTADOS.map(e => <SelectItem key={e}>{e}</SelectItem>)}
              </Select>

              <Input label="Fecha ingreso" type="date" value={form.fecha_ingreso ?? ""} onValueChange={(v)=>setForm(f=>({...f,fecha_ingreso:v}))} />
              <Input label="Fecha salida" type="date" value={form.fecha_salida ?? ""} onValueChange={(v)=>setForm(f=>({...f,fecha_salida:v}))} />
              <Input label="Fecha vencimiento" type="date" value={form.fecha_vencimiento ?? ""} onValueChange={(v)=>setForm(f=>({...f,fecha_vencimiento:v}))} />

              {/* Imagen */}
              <div className="flex flex-col gap-2 md:col-span-3">
                <label className="text-sm font-medium">Imagen</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file" accept="image/*"
                    onChange={(e)=>{ const file = e.target.files?.[0]; if (file) setForm(f=>({...f,img_url:URL.createObjectURL(file)})); }}
                  />
                </div>
                <div className="w-full h-44 rounded-xl border border-default-200 grid place-items-center overflow-hidden">
                  {form.img_url ? <img src={form.img_url} className="object-cover w-full h-full" /> :
                    <div className="flex items-center gap-2 text-foreground-400"><ImageIcon className="w-5 h-5" /> sin imagen</div>}
                </div>
              </div>
            </div>

            {/* Selects + tuercas al lado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex gap-2">
                <Select label="Proveedor" className="w-full" selectedKeys={new Set(form.proveedorId ? [form.proveedorId] : [])} onSelectionChange={(keys)=>{ const k = Array.from(keys)[0] as string|undefined; setForm(f=>({...f,proveedorId:k})) }}>
                  {proveedores.map(p => (<SelectItem key={p.id}>{p.nombre_proveedor}</SelectItem>))}
                </Select>
                <Button isIconOnly variant="flat" onPress={() => setOpenProvMgr(true)} title="Gestionar proveedores"><Settings className="w-4 h-4" /></Button>
              </div>

              <div className="flex gap-2">
                <Select label="Almacén" className="w-full" selectedKeys={new Set(form.almacenId ? [form.almacenId] : [])} onSelectionChange={(keys)=>{ const k = Array.from(keys)[0] as string|undefined; setForm(f=>({...f,almacenId:k})) }}>
                  {almacenes.map(a => (<SelectItem key={a.id}>{a.nombre_almacen}</SelectItem>))}
                </Select>
                <Button isIconOnly variant="flat" onPress={() => setOpenAlmMgr(true)} title="Gestionar almacenes"><Settings className="w-4 h-4" /></Button>
              </div>

              <div className="flex gap-2">
                <Select label="Categoría" className="w-full" selectedKeys={new Set(form.categoriaId ? [form.categoriaId] : [])} onSelectionChange={(keys)=>{ const k = Array.from(keys)[0] as string|undefined; setForm(f=>({...f,categoriaId:k})) }}>
                  {categorias.map(c => (<SelectItem key={c.id}>{c.nombre_categoria}</SelectItem>))}
                </Select>
                <Button isIconOnly variant="flat" onPress={() => setOpenCatMgr(true)} title="Gestionar categorías"><Settings className="w-4 h-4" /></Button>
              </div>
            </div>

            <Textarea label="Descripción" minRows={3} value={form.descripcion ?? ""} onValueChange={(v)=>setForm(f=>({...f,descripcion:v}))} />
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={() => setOpenRegistrar(false)}>Cancelar</Button>
            <Button color="primary" onPress={onRegistrarSubmit}>{editId ? "Guardar cambios" : "Registrar"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===================== Modal: Ingresar stock (Entrada en unidades) ===================== */}
      <Modal isOpen={openIngresar} onOpenChange={setOpenIngresar} size="xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Ingresar stock (Entrada)</ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="text-sm text-foreground-500 mb-1">Seleccionar insumo</div>
                <Select
                  aria-label="Seleccionar insumo"
                  selectedKeys={new Set(ingSelId ? [ingSelId] : [])}
                  onSelectionChange={(keys)=>{ const k = Array.from(keys)[0] as string|undefined; setIngSelId(k ?? null) }}
                  items={insumosFiltradosIngreso}
                  listboxProps={{
                    emptyContent: "Sin resultados",
                    topContent: (
                      <div className="px-2 py-2 sticky top-0 bg-content1 z-10 rounded-md border border-default-200">
                        <Input size="sm" placeholder="Buscar insumo…" startContent={<Search className="w-4 h-4" />} value={ingSearch} onValueChange={setIngSearch} classNames={{ inputWrapper: "h-9" }} />
                      </div>
                    ),
                  }}
                  renderValue={(items)=> <>{items[0]?.textValue}</>}
                >
                  {(i: Insumo) => (<SelectItem key={i.id_insumo_pk} textValue={`${i.nombre} — ${i.tipo} (${i.unidad_medida})`}>{i.nombre} — {i.tipo} ({i.unidad_medida})</SelectItem>)}
                </Select>
              </div>

              <Input label="Cantidad (unidades)" type="number" min={1} value={String(ingCantidad)} onValueChange={(v)=>setIngCantidad(Number(v||0))} />
              <Input label="Costo por unidad" type="number" min={0} value={String(ingCosto)} onValueChange={(v)=>setIngCosto(Number(v||0))} />
              <Select label="Almacén" selectedKeys={new Set(ingAlmacen ? [ingAlmacen] : [])} onSelectionChange={(k)=>setIngAlmacen(Array.from(k)[0] as string)}>
                {almacenes.map(a => (<SelectItem key={a.id}>{a.nombre_almacen}</SelectItem>))}
              </Select>
              <Select label="Proveedor" selectedKeys={new Set(ingProv ? [ingProv] : [])} onSelectionChange={(k)=>setIngProv(Array.from(k)[0] as string)}>
                {proveedores.map(p => (<SelectItem key={p.id}>{p.nombre_proveedor}</SelectItem>))}
              </Select>
            </div>

            <div className="text-xs text-foreground-500">
              Esta acción generará un movimiento: <b>tipo</b> <Chip size="sm" color="success" variant="flat">entrada</Chip> — <b>motivo</b> compra.
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setOpenIngresar(false)}>Cancelar</Button>
            <Button color="primary" startContent={<ArrowDownCircle className="w-4 h-4" />} onPress={onIngresarSubmit}>Registrar entrada</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===================== Modal: Salida por actividad (Base) ===================== */}
      <Modal isOpen={!!openSalida} onOpenChange={()=>setOpenSalida(null)} size="xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Salida por actividad</ModalHeader>
          <ModalBody className="space-y-4">
            {openSalida && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Insumo" readOnly value={openSalida.nombre} />
                  <Input label="Stock base" readOnly value={`${openSalida.stock_base} ${openSalida.unidad_medida}`} />
                  <Input label="Unidad base" readOnly value={openSalida.unidad_medida} />
                  <Input label={`Cantidad (${openSalida.unidad_medida})`} type="number" min={1} value={String(salCantidad)} onValueChange={(v)=>setSalCantidad(Number(v||0))} />
                  <Select label="Almacén" selectedKeys={new Set(salAlmacen ? [salAlmacen] : [])} onSelectionChange={(k)=>setSalAlmacen(Array.from(k)[0] as string)}>
                    {almacenes.map(a => (<SelectItem key={a.id}>{a.nombre_almacen}</SelectItem>))}
                  </Select>
                </div>

                <Divider />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Actividad" value={salActividad.nombre} onValueChange={(v)=>setSalActividad(s=>({...s,nombre:v}))} />
                  <Input label="Encargado" value={salActividad.encargado} onValueChange={(v)=>setSalActividad(s=>({...s,encargado:v}))} />
                  <Input label="Categoría" value={salActividad.categoria} onValueChange={(v)=>setSalActividad(s=>({...s,categoria:v}))} />
                </div>

                <div className="text-xs text-foreground-500">
                  Esta acción generará un movimiento: <b>tipo</b> <Chip size="sm" color="danger" variant="flat">salida</Chip> — <b>motivo</b> consumo_actividad.
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setOpenSalida(null)}>Cancelar</Button>
            <Button color="danger" startContent={<ArrowUpCircle className="w-4 h-4" />} onPress={onSalidaSubmit}>Registrar salida</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===================== Modal: Ajuste por corrección (Base) ===================== */}
      <Modal isOpen={!!openAjuste} onOpenChange={()=>setOpenAjuste(null)} size="xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Ajuste por corrección (Salida)</ModalHeader>
          <ModalBody className="space-y-4">
            {openAjuste && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Insumo" readOnly value={openAjuste.nombre} />
                  <Input label="Stock base" readOnly value={`${openAjuste.stock_base} ${openAjuste.unidad_medida}`} />
                  <Input label="Unidad base" readOnly value={openAjuste.unidad_medida} />
                  <Input label={`Cantidad (${openAjuste.unidad_medida})`} type="number" min={1} value={String(ajCantidad)} onValueChange={(v)=>setAjCantidad(Number(v||0))} />
                  <Select label="Almacén" selectedKeys={new Set(ajAlmacen ? [ajAlmacen] : [])} onSelectionChange={(k)=>setAjAlmacen(Array.from(k)[0] as string)}>
                    {almacenes.map(a => (<SelectItem key={a.id}>{a.nombre_almacen}</SelectItem>))}
                  </Select>
                </div>
                <Textarea label="Descripción del ajuste (motivo del error)" minRows={3} value={ajObs} onValueChange={setAjObs} />
                <div className="text-xs text-foreground-500">
                  Se registrará un movimiento <b>salida</b> con motivo <b>ajuste_manual</b> y quedará visible en el historial.
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setOpenAjuste(null)}>Cancelar</Button>
            <Button color="danger" startContent={<ArrowUpCircle className="w-4 h-4" />} onPress={onAjusteSubmit}>
              Registrar ajuste
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===================== Modal: Detalle Insumo ===================== */}
      <Modal isOpen={!!openDetalle} onOpenChange={() => setOpenDetalle(null)} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Detalle del insumo</ModalHeader>
          <ModalBody className="space-y-4">
            {openDetalle && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Nombre" readOnly value={openDetalle.nombre} />
                  <Input label="Tipo" readOnly value={openDetalle.tipo} />
                  <Input label="Estado" readOnly value={openDetalle.estado_insumo} />
                  <Input label="Stock base" readOnly value={`${openDetalle.stock_base} ${openDetalle.unidad_medida}`} />
                  <Input label="Tamaño x unidad" readOnly value={packLabel(openDetalle)} />
                  <Input label="Stock (unidades)" readOnly value={unidadesLabel(openDetalle)} />
                  <Input label="Costo (por unidad de venta)" readOnly value={`$${openDetalle.costo.toLocaleString()}`} />
                  <Input label="Ingreso" readOnly value={openDetalle.fecha_ingreso} />
                  <Input label="Salida" readOnly value={openDetalle.fecha_salida ?? "—"} />
                  <Input label="Vencimiento" readOnly value={openDetalle.fecha_vencimiento ?? "—"} />
                  <Input label="Proveedor" readOnly value={nombreProveedor(openDetalle.proveedorId)} />
                  <Input label="Almacén" readOnly value={nombreAlmacen(openDetalle.almacenId)} />
                  <Input label="Categoría" readOnly value={nombreCategoria(openDetalle.categoriaId)} />
                </div>

                <Textarea label="Descripción" readOnly value={openDetalle.descripcion ?? ""} />
                <div className="w-full h-56 rounded-xl border border-default-200 grid place-items-center overflow-hidden">
                  {openDetalle.img_url ? (
                    <img src={openDetalle.img_url} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center gap-2 text-foreground-400">
                      <ImageIcon className="w-5 h-5" /> sin imagen
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-between">
                  <Button variant="flat" startContent={<Pencil className="w-4 h-4" />} onPress={() => onEdit(openDetalle)}>
                    editar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="flat" onPress={() => setOpenSalida(openDetalle)}>Salida por actividad</Button>
                    <Button variant="flat" onPress={() => setOpenAjuste(openDetalle)}>Ajuste por corrección</Button>
                    <Button color="danger" variant="flat" startContent={<Trash2 className="w-4 h-4" />} onPress={() => onDelete(openDetalle.id_insumo_pk)}>
                      eliminar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setOpenDetalle(null)}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===================== Modal: Visor de tarjeta de movimiento ===================== */}
      <Modal isOpen={!!movView} onOpenChange={()=>setMovView(null)} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Detalle del movimiento</ModalHeader>
          <ModalBody className="space-y-2">
            {movView && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color={movView.tipo === "entrada" ? "success" : "danger"} variant="flat">
                      {movView.tipo}
                    </Chip>
                    <span className="text-sm text-foreground-500">{movView.fecha}</span>
                  </div>
                  <div className="text-xs text-foreground-500">{nombreAlmacen(movView.id_almacen)}</div>
                </div>
                <div className="text-sm font-medium">{insumoById(movView.id_insumo)?.nombre ?? movView.id_insumo}</div>
                <div className="text-xs text-foreground-500">
                  {/* Muestra ambas vistas si están disponibles */}
                  {typeof movView.cantidad === "number" && (
                    <span className="mr-2">{movView.cantidad} u</span>
                  )}
                  <span>{movView.cantidad_base} {insumoById(movView.id_insumo)?.unidad_medida ?? ""}</span>
                </div>
                <Divider />
                {movView.tipo === "entrada" ? (
                  <div className="text-sm space-y-1">
                    <Row label="Categoría" value={nombreCategoria(insumoById(movView.id_insumo)?.categoriaId)} />
                    <Row label="Fecha del movimiento" value={movView.fecha} />
                    <Row label="Almacén de destino" value={nombreAlmacen(movView.id_almacen)} />
                    <Row label="Proveedor" value={nombreProveedor(movView.id_proveedor)} />
                    <Row label="Responsable" value={movView.responsable || "—"} />
                    {typeof movView.valor_movimiento === "number" &&
                      <Row label="Valor del movimiento" value={`$${Math.abs(movView.valor_movimiento).toLocaleString()}`} />}
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <Row label="Actividad que lo usó" value={movView.actividad_nombre || "—"} />
                    <Row label="Encargado de la actividad" value={movView.actividad_encargado || "—"} />
                    <Row label="Categoría de actividad" value={movView.actividad_categoria || "—"} />
                    <Row label="Fecha del movimiento" value={movView.fecha} />
                    <Row label="Almacén de donde salió" value={nombreAlmacen(movView.id_almacen)} />
                    <Row label="Responsable del registro" value={movView.responsable || "—"} />
                    {typeof movView.valor_movimiento === "number" &&
                      <Row label="Valor del movimiento" value={`-$${Math.abs(movView.valor_movimiento).toLocaleString()}`} />}
                    {movView.observacion && <Row label="Observación" value={movView.observacion} />}
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={()=>setMovView(null)}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ===================== Gestores catálogos (tuercas) ===================== */}
      <ProveedoresManager
        isOpen={openProvMgr}
        onOpenChange={setOpenProvMgr}
        proveedores={proveedores}
        onCreate={(p)=> setProveedores(prev => [...prev, p])}
        onUpdate={(p)=> setProveedores(prev => prev.map(x => x.id === p.id ? p : x))}
        onDelete={(id)=> setProveedores(prev => prev.filter(x => x.id !== id))}
      />
      <AlmacenesManager
        isOpen={openAlmMgr}
        onOpenChange={setOpenAlmMgr}
        almacenes={almacenes}
        onCreate={(a)=> setAlmacenes(prev => [...prev, a])}
        onUpdate={(a)=> setAlmacenes(prev => prev.map(x => x.id === a.id ? a : x))}
        onDelete={(id)=> setAlmacenes(prev => prev.filter(x => x.id !== id))}
      />
      <CategoriasManager
        isOpen={openCatMgr}
        onOpenChange={setOpenCatMgr}
        categorias={categorias}
        onCreate={(c)=> setCategorias(prev => [...prev, c])}
        onUpdate={(c)=> setCategorias(prev => prev.map(x => x.id === c.id ? c : x))}
        onDelete={(id)=> setCategorias(prev => prev.filter(x => x.id !== id))}
      />
    </div>
  );
}

/* ===================== Sección: Lista de insumos ===================== */
function ListaInsumosSection({
  insumos, totalPages, page, setPage,
  q, setQ, fProv, setFProv, fAlm, setFAlm, fCat, setFCat,
  proveedores, almacenes, categorias, onVer,
  onOpenProvMgr, onOpenAlmMgr, onOpenCatMgr
}:{
  insumos: Insumo[];
  totalPages: number;
  page: number;
  setPage: (p:number)=>void;
  q: string; setQ: (v:string)=>void;
  fProv: string|null; setFProv:(v:string|null)=>void;
  fAlm: string|null; setFAlm:(v:string|null)=>void;
  fCat: string|null; setFCat:(v:string|null)=>void;
  proveedores: Proveedor[]; almacenes: Almacen[]; categorias: Categoria[];
  onVer: (i:Insumo)=>void;
  onOpenProvMgr:()=>void; onOpenAlmMgr:()=>void; onOpenCatMgr:()=>void;
}) {
  return (
    <>
      {/* Filtros con títulos + tuercas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="col-span-2">
          <div className="text-xs text-foreground-500 mb-1">Buscador</div>
          <Input placeholder="Buscar por nombre, tipo o medida…" startContent={<Search className="w-4 h-4" />} value={q} onValueChange={(v) => setQ(v)} />
        </div>

        <div className="flex flex-col">
          <div className="text-xs text-foreground-500 mb-1">Proveedor</div>
          <div className="flex gap-2">
            <Select aria-label="Proveedor" className="w-full" selectedKeys={new Set(fProv ? [fProv] : [])} onSelectionChange={(keys) => { const k = Array.from(keys)[0] as string | undefined; setFProv(k ?? null); }}>
              {proveedores.map(p => (<SelectItem key={p.id}>{p.nombre_proveedor}</SelectItem>))}
            </Select>
            <Button isIconOnly variant="flat" onPress={onOpenProvMgr} title="Gestionar proveedores"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-xs text-foreground-500 mb-1">Almacén</div>
          <div className="flex gap-2">
            <Select aria-label="Almacén" className="w-full" selectedKeys={new Set(fAlm ? [fAlm] : [])} onSelectionChange={(keys) => { const k = Array.from(keys)[0] as string | undefined; setFAlm(k ?? null); }}>
              {almacenes.map(a => (<SelectItem key={a.id}>{a.nombre_almacen}</SelectItem>))}
            </Select>
            <Button isIconOnly variant="flat" onPress={onOpenAlmMgr} title="Gestionar almacenes"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-xs text-foreground-500 mb-1">Categoría</div>
          <div className="flex gap-2">
            <Select aria-label="Categoría" className="w-full" selectedKeys={new Set(fCat ? [fCat] : [])} onSelectionChange={(keys) => { const k = Array.from(keys)[0] as string | undefined; setFCat(k ?? null); }}>
              {categorias.map(c => (<SelectItem key={c.id}>{c.nombre_categoria}</SelectItem>))}
            </Select>
            <Button isIconOnly variant="flat" onPress={onOpenCatMgr} title="Gestionar categorías"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table aria-label="Tabla de insumos">
        <TableHeader>
          <TableColumn>Imagen</TableColumn>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Categoría</TableColumn>
          <TableColumn>Stock base</TableColumn>
          <TableColumn>Unidad base</TableColumn>
          <TableColumn>Tamaño x unidad</TableColumn>
          <TableColumn>Stock (unidades)</TableColumn>
          <TableColumn>Costo x unidad</TableColumn>
          <TableColumn>Proveedor</TableColumn>
          <TableColumn>Ingreso</TableColumn>
          <TableColumn className="text-right">Acción</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Sin insumos">
          {insumos.map(i => (
            <TableRow key={i.id_insumo_pk}>
              <TableCell>
                <div className="h-8 w-8 rounded-full bg-default-200 overflow-hidden grid place-items-center">
                  {i.img_url ? <img src={i.img_url} className="object-cover h-full w-full" /> : <span className="text-xs">img</span>}
                </div>
              </TableCell>
              <TableCell className="truncate">{i.nombre}</TableCell>
              <TableCell className="truncate">{i.categoriaId ? categorias.find(c=>c.id===i.categoriaId)?.nombre_categoria : "—"}</TableCell>

              <TableCell>{i.stock_base} {i.unidad_medida}</TableCell>
              <TableCell>{i.unidad_medida}</TableCell>
              <TableCell>{packLabel(i)}</TableCell>
              <TableCell>{unidadesLabel(i)}</TableCell>

              <TableCell>${i.costo.toLocaleString()}</TableCell>
              <TableCell>{i.proveedorId ? proveedores.find(p=>p.id===i.proveedorId)?.nombre_proveedor : "—"}</TableCell>
              <TableCell>{i.fecha_ingreso}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="flat" startContent={<Eye className="w-4 h-4" />} onPress={() => onVer(i)}>ver</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex justify-end">
        <Pagination total={totalPages} page={page} onChange={setPage} />
      </div>
    </>
  );
}

/* ===================== Sección: Historial (kardex + cards) ===================== */
function HistorialSection({
  movs, buscarInsumoId, setBuscarInsumoId, tipo, setTipo, desde, setDesde, hasta, setHasta,
  insumos, nombreProveedor, nombreAlmacen, nombreCategoria, insumoById, setMovView
}:{
  movs: Movimiento[];
  buscarInsumoId: string|null; setBuscarInsumoId:(v:string|null)=>void;
  tipo: TipoMov | "todos"; setTipo:(v:TipoMov | "todos")=>void;
  desde: string|null; setDesde:(v:string|null)=>void;
  hasta: string|null; setHasta:(v:string|null)=>void;
  insumos: Insumo[];
  nombreProveedor:(id?:string)=>string;
  nombreAlmacen:(id?:string)=>string;
  nombreCategoria:(id?:string)=>string;
  insumoById:(id:string)=>Insumo|undefined;
  setMovView:(m:Movimiento|null)=>void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select label="Insumo" selectedKeys={new Set(buscarInsumoId ? [buscarInsumoId] : [])} onSelectionChange={(k)=>setBuscarInsumoId((Array.from(k)[0] as string) ?? null)}>
          {insumos.map(i => (<SelectItem key={i.id_insumo_pk}>{i.nombre}</SelectItem>))}
        </Select>

        <Select label="Tipo de movimiento" selectedKeys={new Set([tipo])} onSelectionChange={(k)=>setTipo(Array.from(k)[0] as any)}>
          <SelectItem key="todos">Todos</SelectItem>
          <SelectItem key="entrada">Entrada</SelectItem>
          <SelectItem key="salida">Salida</SelectItem>
        </Select>

        <Input label="Desde" type="date" value={desde ?? ""} onValueChange={(v)=>setDesde(v || null)} />
        <Input label="Hasta" type="date" value={hasta ?? ""} onValueChange={(v)=>setHasta(v || null)} />
      </div>

      {/* Cards de movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {movs.map(m => {
          const ins = insumoById(m.id_insumo);
          const isEntrada = m.tipo === "entrada";
          return (
            <Card key={m.id} shadow="sm" className="border border-default-200">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color={isEntrada ? "success" : "danger"} variant="flat">
                      {isEntrada ? "entrada" : "salida"}
                    </Chip>
                    <span className="text-sm text-foreground-500">{m.fecha}</span>
                  </div>
                  <div className="text-xs text-foreground-500">{nombreAlmacen(m.id_almacen)}</div>
                </div>

                <div className="text-sm font-medium">{ins?.nombre ?? m.id_insumo}</div>
                <div className="text-xs text-foreground-500">
                  {typeof m.cantidad === "number" && <span className="mr-2">{m.cantidad} u</span>}
                  <span>{m.cantidad_base} {ins?.unidad_medida ?? ""}</span>
                </div>

                <Divider />

                {isEntrada ? (
                  <div className="text-sm space-y-1">
                    <Row label="Categoría" value={nombreCategoria(ins?.categoriaId)} />
                    <Row label="Fecha del movimiento" value={m.fecha} />
                    <Row label="Almacén de destino" value={nombreAlmacen(m.id_almacen)} />
                    <Row label="Proveedor" value={nombreProveedor(m.id_proveedor)} />
                    <Row label="Responsable" value={m.responsable || "—"} />
                    {typeof m.valor_movimiento === "number" && (
                      <Row label="Valor del movimiento" value={`$${Math.abs(m.valor_movimiento).toLocaleString()}`} />
                    )}
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <Row label="Actividad que lo usó" value={m.actividad_nombre || "—"} />
                    <Row label="Encargado de la actividad" value={m.actividad_encargado || "—"} />
                    <Row label="Categoría de actividad" value={m.actividad_categoria || "—"} />
                    <Row label="Fecha del movimiento" value={m.fecha} />
                    <Row label="Almacén de donde salió" value={nombreAlmacen(m.id_almacen)} />
                    <Row label="Responsable del registro" value={m.responsable || "—"} />
                    {typeof m.valor_movimiento === "number" && (
                      <Row label="Valor del movimiento" value={`-$${Math.abs(m.valor_movimiento).toLocaleString()}`} />
                    )}
                    {m.observacion && <Row label="Observación" value={m.observacion} />}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="flat" startContent={<Eye className="w-4 h-4" />} onPress={() => setMovView(m)}>
                    ver tarjeta
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Row({label, value}:{label:string; value:string}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-foreground-500">{label}</span>
      <span className="font-medium text-right truncate">{value || "—"}</span>
    </div>
  );
}

/* ===================== Managers de catálogos ===================== */
function ProveedoresManager({
  isOpen, onOpenChange, proveedores, onCreate, onUpdate, onDelete
}:{
  isOpen:boolean; onOpenChange:(v:boolean)=>void;
  proveedores: Proveedor[];
  onCreate:(p:Proveedor)=>void; onUpdate:(p:Proveedor)=>void; onDelete:(id:string)=>void;
}) {
  const [nuevo, setNuevo] = useState<Proveedor>({ id: "", nombre_proveedor: "", direccion_proveedor: "", email_proveedor: "", telefono_proveedor: "" });
  const [edit, setEdit] = useState<Proveedor | null>(null);
  const clearNuevo = () => setNuevo({ id:"", nombre_proveedor:"", direccion_proveedor:"", email_proveedor:"", telefono_proveedor:"" });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Proveedores</ModalHeader>
        <ModalBody className="space-y-4">
          {/* Crear */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="Nombre proveedor" value={nuevo.nombre_proveedor} onValueChange={(v)=>setNuevo(n=>({...n,nombre_proveedor:v}))}/>
            <Input placeholder="Dirección"          value={nuevo.direccion_proveedor || ""} onValueChange={(v)=>setNuevo(n=>({...n,direccion_proveedor:v}))}/>
            <Input placeholder="Email"              value={nuevo.email_proveedor || ""} onValueChange={(v)=>setNuevo(n=>({...n,email_proveedor:v}))}/>
            <div className="flex gap-2">
              <Input placeholder="Teléfono" className="w-full" value={nuevo.telefono_proveedor || ""} onValueChange={(v)=>setNuevo(n=>({...n,telefono_proveedor:v}))}/>
              <Button color="primary" startContent={<Plus className="w-4 h-4"/>}
                onPress={()=>{ if(!nuevo.nombre_proveedor.trim()) return; const item: Proveedor = { ...nuevo, id:`p${Date.now()}` }; onCreate(item); clearNuevo(); }}>
                Agregar
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <Table aria-label="Tabla de proveedores">
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Dirección</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Teléfono</TableColumn>
              <TableColumn className="text-right">Acción</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sin proveedores">
              {proveedores.map((p)=>(
                <TableRow key={p.id}>
                  <TableCell>{edit?.id===p.id ? <Input size="sm" value={edit.nombre_proveedor} onValueChange={(v)=>setEdit(e=>({...e!,nombre_proveedor:v}))}/> : p.nombre_proveedor}</TableCell>
                  <TableCell>{edit?.id===p.id ? <Input size="sm" value={edit.direccion_proveedor || ""} onValueChange={(v)=>setEdit(e=>({...e!,direccion_proveedor:v}))}/> : (p.direccion_proveedor || "—")}</TableCell>
                  <TableCell>{edit?.id===p.id ? <Input size="sm" value={edit.email_proveedor || ""} onValueChange={(v)=>setEdit(e=>({...e!,email_proveedor:v}))}/> : (p.email_proveedor || "—")}</TableCell>
                  <TableCell>{edit?.id===p.id ? <Input size="sm" value={edit.telefono_proveedor || ""} onValueChange={(v)=>setEdit(e=>({...e!,telefono_proveedor:v}))}/> : (p.telefono_proveedor || "—")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {edit?.id===p.id ? (
                        <>
                          <Button size="sm" variant="flat" onPress={() => { onUpdate(edit); setEdit(null); }}>guardar</Button>
                          <Button size="sm" variant="flat" onPress={() => setEdit(null)}>cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="flat" onPress={() => setEdit(p)}>editar</Button>
                          <Button size="sm" color="danger" variant="flat" onPress={() => onDelete(p.id)}>borrar</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter><Button color="primary" onPress={() => onOpenChange(false)}>Cerrar</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function AlmacenesManager({
  isOpen, onOpenChange, almacenes, onCreate, onUpdate, onDelete
}:{
  isOpen:boolean; onOpenChange:(v:boolean)=>void;
  almacenes: Almacen[]; onCreate:(a:Almacen)=>void; onUpdate:(a:Almacen)=>void; onDelete:(id:string)=>void;
}) {
  const [nuevo, setNuevo] = useState<string>("");
  const [edit, setEdit] = useState<Almacen | null>(null);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Almacenes</ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Nombre almacén" value={nuevo} onValueChange={setNuevo}/>
            <Button color="primary" startContent={<Plus className="w-4 h-4"/>}
              onPress={()=>{ if(!nuevo.trim()) return; onCreate({ id:`a${Date.now()}`, nombre_almacen: nuevo.trim() }); setNuevo(""); }}>
              Agregar
            </Button>
          </div>

          <Table aria-label="Tabla de almacenes">
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn className="text-right">Acción</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sin almacenes">
              {almacenes.map((a)=>(
                <TableRow key={a.id}>
                  <TableCell>{edit?.id===a.id ? <Input size="sm" value={edit.nombre_almacen} onValueChange={(v)=>setEdit(e=>({...e!,nombre_almacen:v}))}/> : a.nombre_almacen}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {edit?.id===a.id ? (
                        <>
                          <Button size="sm" variant="flat" onPress={() => { onUpdate(edit); setEdit(null); }}>guardar</Button>
                          <Button size="sm" variant="flat" onPress={() => setEdit(null)}>cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="flat" onPress={() => setEdit(a)}>editar</Button>
                          <Button size="sm" color="danger" variant="flat" onPress={() => onDelete(a.id)}>borrar</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter><Button color="primary" onPress={() => onOpenChange(false)}>Cerrar</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function CategoriasManager({
  isOpen, onOpenChange, categorias, onCreate, onUpdate, onDelete
}:{
  isOpen:boolean; onOpenChange:(v:boolean)=>void;
  categorias: Categoria[]; onCreate:(c:Categoria)=>void; onUpdate:(c:Categoria)=>void; onDelete:(id:string)=>void;
}) {
  const [nuevo, setNuevo] = useState<{nombre:string; descripcion:string}>({nombre:"", descripcion:""});
  const [edit, setEdit] = useState<Categoria | null>(null);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Categorías</ModalHeader>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Nombre categoría" value={nuevo.nombre} onValueChange={(v)=>setNuevo(s=>({...s,nombre:v}))}/>
            <Input placeholder="Descripción" value={nuevo.descripcion} onValueChange={(v)=>setNuevo(s=>({...s,descripcion:v}))}/>
            <div className="flex">
              <Button color="primary" className="ml-auto" startContent={<Plus className="w-4 h-4"/>}
                onPress={()=>{ if(!nuevo.nombre.trim()) return; onCreate({ id:`c${Date.now()}`, nombre_categoria: nuevo.nombre.trim(), descripcion_categoria: nuevo.descripcion.trim() || undefined }); setNuevo({nombre:"", descripcion:""}); }}>
                Agregar
              </Button>
            </div>
          </div>

          <Table aria-label="Tabla de categorías">
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Descripción</TableColumn>
              <TableColumn className="text-right">Acción</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sin categorías">
              {categorias.map((c)=>(
                <TableRow key={c.id}>
                  <TableCell>{edit?.id===c.id ? <Input size="sm" value={edit.nombre_categoria} onValueChange={(v)=>setEdit(e=>({...e!,nombre_categoria:v}))}/> : c.nombre_categoria}</TableCell>
                  <TableCell>{edit?.id===c.id ? <Input size="sm" value={edit.descripcion_categoria || ""} onValueChange={(v)=>setEdit(e=>({...e!,descripcion_categoria:v}))}/> : (c.descripcion_categoria || "—")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {edit?.id===c.id ? (
                        <>
                          <Button size="sm" variant="flat" onPress={() => { onUpdate(edit); setEdit(null); }}>guardar</Button>
                          <Button size="sm" variant="flat" onPress={() => setEdit(null)}>cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="flat" onPress={() => setEdit(c)}>editar</Button>
                          <Button size="sm" color="danger" variant="flat" onPress={() => onDelete(c.id)}>borrar</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter><Button color="primary" onPress={() => onOpenChange(false)}>Cerrar</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
