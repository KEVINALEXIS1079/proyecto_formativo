import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Chip, Input, Select, SelectItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider, Switch,
  ButtonGroup, Tooltip
} from "@heroui/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ReferenceArea, ReferenceLine
} from "recharts";
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, Image as ImgIcon } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   Tipos según tu diagrama
   ────────────────────────────────────────────────────────────────────────── */
type LoteId = "A" | "B" | "C" | "D";

type TipoSensor = {
  id_tipo_sensor_pk: string;
  nombre_tipo_sensor: "temperatura" | "humedad" | "ph" | "radiacion";
  unidades: string;
  decimales: number;
  imagen_tipo_sensor: string;
};

type Sensor = {
  id_sensor_pk: string;
  id_tipo_sensor_pk: string; // FK tipo
  id_lote_fk: LoteId;
  nombre_sensor: string;
  broker: string;
  port: number;
  topic: string;
  valor_minimo: number;
  valor_maximo: number;
  activo: boolean;
};

type Punto = { ts: number; value: number; sensorId: string };

/* ──────────────────────────────────────────────────────────────────────────
   Semillas y helpers
   ────────────────────────────────────────────────────────────────────────── */
const LOTES: LoteId[] = ["A", "B", "C", "D"];
const uid = () => Math.random().toString(36).slice(2) + Date.now();

const TIPO_BASE: Record<TipoSensor["nombre_tipo_sensor"], { unidades: string; decimales: number; img: string; color: string; gradId: string }> = {
  temperatura: { unidades: "°C",  decimales: 1, img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=1200&auto=format&fit=crop", color: "#3b82f6", gradId: "gTemp" },
  humedad:     { unidades: "%",    decimales: 0, img: "https://images.unsplash.com/photo-1465146633011-14f8e0781093?q=80&w=1200&auto=format&fit=crop", color: "#22c55e", gradId: "gHum"  },
  ph:          { unidades: "pH",   decimales: 2, img: "https://images.unsplash.com/photo-1581091215367-59ab6b11f6b1?q=80&w=1200&auto=format&fit=crop", color: "#f59e0b", gradId: "gPh"   },
  radiacion:   { unidades: "W/m²", decimales: 0, img: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop", color: "#a855f7", gradId: "gRad"  },
};

function seedTipos(): TipoSensor[] {
  return (["temperatura", "humedad", "ph", "radiacion"] as const).map((n) => ({
    id_tipo_sensor_pk: uid(),
    nombre_tipo_sensor: n,
    unidades: TIPO_BASE[n].unidades,
    decimales: TIPO_BASE[n].decimales,
    imagen_tipo_sensor: TIPO_BASE[n].img
  }));
}
function seedSensores(tipos: TipoSensor[]): Sensor[] {
  const mk = (lote: LoteId, nombre: TipoSensor["nombre_tipo_sensor"]): Sensor => {
    const tipo = tipos.find(t => t.nombre_tipo_sensor === nombre)!;
    const RANGE: Record<typeof nombre, { min: number; max: number }> = {
      temperatura: { min: 10, max: 40 },
      humedad:     { min: 20, max: 100 },
      ph:          { min: 3,  max: 9 },
      radiacion:   { min: 0,  max: 1200 },
    } as any;
    return {
      id_sensor_pk: uid(),
      id_tipo_sensor_pk: tipo.id_tipo_sensor_pk,
      id_lote_fk: lote,
      nombre_sensor: `Sensor ${nombre} ${lote}`,
      broker: "mqtt://localhost",
      port: 1883,
      topic: `agrotech/lote-${lote}/${nombre}`,
      valor_minimo: RANGE[nombre].min,
      valor_maximo: RANGE[nombre].max,
      activo: true
    };
  };
  const out: Sensor[] = [];
  for (const l of LOTES) out.push(mk(l, "temperatura"), mk(l, "humedad"), mk(l, "ph"), mk(l, "radiacion"));
  return out;
}

/* ──────────────────────────────────────────────────────────────────────────
   Simulador de datos por tipo
   ────────────────────────────────────────────────────────────────────────── */
function useSim(keys: Array<{ id: string; tipo: TipoSensor["nombre_tipo_sensor"] }>, enabled = true) {
  const [series, setSeries] = useState<Record<string, Punto[]>>({});
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setSeries(Object.fromEntries(keys.map(({ id }) => [id, []])));
  }, [keys]);

  useEffect(() => {
    if (!enabled) { if (ref.current) clearInterval(ref.current!); return; }
    ref.current = window.setInterval(() => {
      const now = Date.now();
      setSeries(prev => {
        const next: Record<string, Punto[]> = { ...prev };
        keys.forEach(({ id, tipo }, i) => {
          let base=0, amp=0, jit=0;
          if (tipo==="temperatura"){ base=24; amp=6;  jit=0.5; }
          if (tipo==="humedad")    { base=60; amp=25; jit=1.1; }
          if (tipo==="ph")         { base=6.5;amp=0.7;jit=0.06;}
          if (tipo==="radiacion")  { base=600;amp=400;jit=10;  }
          const value = base + Math.sin((now/1000)+i)*amp + (Math.random()-0.5)*2*jit;
          const p: Punto = { ts: now, value: Number(value.toFixed(2)), sensorId: id };
          const arr = next[id] ?? [];
          next[id] = [...arr, p].slice(-180);
        });
        return next;
      });
    }, 900);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [keys, enabled]);

  return series;
}

/* ──────────────────────────────────────────────────────────────────────────
   Página única (layout más limpio; controles agrupados)
   ────────────────────────────────────────────────────────────────────────── */
export default function SensoresProDemo() {
  const initial = useMemo(() => {
    const t = seedTipos();
    return { t, s: seedSensores(t) };
  }, []);

  const [mode, setMode] = useState<"charts" | "config">("charts");
  const [simOn, setSimOn] = useState(true);
  const [tipos, setTipos] = useState<TipoSensor[]>(initial.t);
  const [sensores, setSensores] = useState<Sensor[]>(initial.s);

  // filtros
  const [loteFilter, setLoteFilter] = useState<string>("");
  const [q, setQ] = useState("");

  const tipoById = useMemo(() => Object.fromEntries(tipos.map(t => [t.id_tipo_sensor_pk, t])), [tipos]);

  // simulación
  const simKeys = useMemo(
    () => sensores
      .map(s => {
        const t = tipoById[s.id_tipo_sensor_pk];
        return t ? { id: s.id_sensor_pk, tipo: t.nombre_tipo_sensor } : null;
      })
      .filter(Boolean) as Array<{ id: string; tipo: TipoSensor["nombre_tipo_sensor"] }>,
    [sensores, tipoById]
  );
  const series = useSim(simKeys, simOn);

  const sensorsFiltered = useMemo(() =>
    sensores.filter(s => {
      const t = tipoById[s.id_tipo_sensor_pk];
      const term = q.toLowerCase().trim();
      const matchTerm = !term || s.nombre_sensor.toLowerCase().includes(term) || (t?.nombre_tipo_sensor ?? "").includes(term);
      const matchLote = loteFilter ? s.id_lote_fk === loteFilter : true;
      return matchLote && matchTerm;
    }), [sensores, loteFilter, q, tipoById]);

  const byLote = useMemo(() => {
    const g: Record<LoteId, Sensor[]> = { A:[],B:[],C:[],D:[] } as any;
    sensores.forEach(s => g[s.id_lote_fk].push(s));
    return g;
  }, [sensores]);

  /* ── Modales Tipos ── */
  const [draftTipo, setDraftTipo] = useState<TipoSensor | null>(null);
  const [tipoEditOpen, setTipoEditOpen] = useState(false);
  const [tipoAddOpen, setTipoAddOpen] = useState(false);
  const [tipoDel, setTipoDel] = useState<TipoSensor | null>(null);

  /* ── Modales Sensores ── */
  const [draftSensor, setDraftSensor] = useState<Sensor | null>(null);
  const [sensorEditOpen, setSensorEditOpen] = useState(false);
  const [sensorAddOpen, setSensorAddOpen] = useState(false);
  const [sensorDel, setSensorDel] = useState<Sensor | null>(null);

  // acciones Tipos
  const handleTipoSave = () => { if (!draftTipo) return; setTipos(prev => prev.map(t => t.id_tipo_sensor_pk === draftTipo.id_tipo_sensor_pk ? draftTipo : t)); setTipoEditOpen(false); };
  const handleTipoAdd  = () => { if (!draftTipo) return; setTipos(prev => [...prev, { ...draftTipo, id_tipo_sensor_pk: uid() }]); setTipoAddOpen(false); };
  const handleTipoDelete = () => {
    if (!tipoDel) return;
    setTipos(prev => prev.filter(t => t.id_tipo_sensor_pk !== tipoDel.id_tipo_sensor_pk));
    setSensores(prev => prev.filter(s => s.id_tipo_sensor_pk !== tipoDel.id_tipo_sensor_pk)); // limpia huérfanos
    setTipoDel(null);
  };

  // acciones Sensores
  const handleSensorSave = () => { if (!draftSensor) return; setSensores(prev => prev.map(s => s.id_sensor_pk === draftSensor.id_sensor_pk ? draftSensor : s)); setSensorEditOpen(false); };
  const handleSensorAdd  = () => { if (!draftSensor) return; setSensores(prev => [...prev, { ...draftSensor, id_sensor_pk: uid() }]); setSensorAddOpen(false); };
  const handleSensorDelete = () => { if (!sensorDel) return; setSensores(prev => prev.filter(s => s.id_sensor_pk !== sensorDel.id_sensor_pk)); setSensorDel(null); };

  return (
    <div className="max-w-[1400px] mx-auto p-4">
      <Card className="border border-default-200">
        <CardHeader className="flex flex-col gap-4">
          {/* ── Header ── */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">Sensores — Demo</h2>
              <Chip size="sm" color={simOn ? "success" : "default"} variant="flat">
                {simOn ? "Datos simulados (ON)" : "Simulación OFF"}
              </Chip>
            </div>

            {/* Controles compactos */}
            <div className="flex items-center gap-3 md:justify-end">
              <div className="hidden md:block text-sm text-default-500">Simulación</div>
              <Switch isSelected={simOn} onValueChange={setSimOn} aria-label="Toggle simulación"/>

              <ButtonGroup>
                <Button
                  color={mode==="charts"?"primary":"default"}
                  onClick={()=>setMode("charts")}
                >
                  Ver gráficas
                </Button>
                <Button
                  color={mode==="config"?"primary":"default"}
                  variant={mode==="config"?"solid":"flat"}
                  onClick={()=>setMode("config")}
                >
                  Configurar
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* ── Filtros ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Buscar por nombre o tipo" value={q} onChange={e=>setQ(e.target.value)} />
            <Select label="Filtrar por lote" selectedKeys={[loteFilter]} onChange={e=>setLoteFilter(e.target.value)} items={[{key: "", label: "Todos los lotes"}, ...LOTES.map(l => ({key: l, label: `Lote ${l}`}))]}>
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
            <div className="flex items-end md:justify-end">
              <Button variant="flat" onClick={()=>{ setQ(""); setLoteFilter(""); }}>Limpiar filtros</Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-8">
          {mode === "config" ? (
            <>
              {/* TIPOS */}
              <SectionTitle
                title="Tipos de sensor"
                ctaLabel="Registrar tipo"
                onCta={()=>{
                  const n: TipoSensor["nombre_tipo_sensor"] = "temperatura";
                  setDraftTipo({
                    id_tipo_sensor_pk: uid(),
                    nombre_tipo_sensor: n,
                    unidades: TIPO_BASE[n].unidades,
                    decimales: TIPO_BASE[n].decimales,
                    imagen_tipo_sensor: TIPO_BASE[n].img
                  });
                  setTipoAddOpen(true);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tipos.map((t) => (
                  <TipoTile
                    key={t.id_tipo_sensor_pk}
                    tipo={t}
                    onEdit={() => { setDraftTipo({ ...t }); setTipoEditOpen(true); }}
                    onDelete={() => setTipoDel(t)}
                  />
                ))}
              </div>

              <Divider />

              {/* SENSORES */}
              <SectionTitle
                title="Sensores"
                ctaLabel="Registrar sensor"
                onCta={()=>{
                  const tipo = tipos[0];
                  setDraftSensor({
                    id_sensor_pk: uid(),
                    id_tipo_sensor_pk: tipo.id_tipo_sensor_pk,
                    id_lote_fk: "A",
                    nombre_sensor: "Nuevo sensor",
                    broker: "mqtt://localhost",
                    port: 1883,
                    topic: `agrotech/lote-A/${tipo.nombre_tipo_sensor}`,
                    valor_minimo: 10,
                    valor_maximo: 40,
                    activo: true
                  });
                  setSensorAddOpen(true);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sensorsFiltered.map((s) => (
                  <SensorTile
                    key={s.id_sensor_pk}
                    sensor={s}
                    tipo={tipoById[s.id_tipo_sensor_pk]}
                    onEdit={() => { setDraftSensor({ ...s }); setSensorEditOpen(true); }}
                    onDelete={() => setSensorDel(s)}
                  />
                ))}
                {!sensorsFiltered.length && <div className="text-sm text-default-500">Sin resultados…</div>}
              </div>
            </>
          ) : (
            <>
              {LOTES.filter(l => (loteFilter ? l === loteFilter : true)).map((lote) => (
                <LoteRow key={lote} lote={lote} sensores={byLote[lote]} tipos={tipos} series={series} />
              ))}
            </>
          )}
        </CardBody>
      </Card>

      {/* ─── Modales Tipos ─── */}
      <Modal isOpen={tipoEditOpen} onOpenChange={setTipoEditOpen} size="lg">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Editar tipo de sensor</ModalHeader>
              <ModalBody>
                {draftTipo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select label="Nombre del tipo" selectedKeys={[draftTipo.nombre_tipo_sensor]} onChange={e=>{
                      const n = e.target.value as TipoSensor["nombre_tipo_sensor"];
                      const base = TIPO_BASE[n];
                      setDraftTipo({ ...draftTipo, nombre_tipo_sensor: n, unidades: base.unidades, decimales: base.decimales, imagen_tipo_sensor: base.img });
                    }}>
                      {(["temperatura","humedad","ph","radiacion"] as const).map(n => <SelectItem key={n}>{n}</SelectItem>)}
                    </Select>
                    <Input label="Unidades" value={draftTipo.unidades} onChange={e=>setDraftTipo({ ...draftTipo, unidades: e.target.value })}/>
                    <Input type="number" label="Decimales" value={String(draftTipo.decimales)} onChange={e=>setDraftTipo({ ...draftTipo, decimales: Number(e.target.value)||0 })}/>
                    <Input label="Imagen (URL)" value={draftTipo.imagen_tipo_sensor} onChange={e=>setDraftTipo({ ...draftTipo, imagen_tipo_sensor: e.target.value })} startContent={<ImgIcon size={16}/>}/>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={()=>setTipoEditOpen(false)}>Cancelar</Button>
                <Button color="primary" onClick={handleTipoSave}>Guardar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={tipoAddOpen} onOpenChange={setTipoAddOpen} size="lg">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Registrar tipo de sensor</ModalHeader>
              <ModalBody>
                {draftTipo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select label="Nombre del tipo" selectedKeys={[draftTipo.nombre_tipo_sensor]} onChange={e=>{
                      const n = e.target.value as TipoSensor["nombre_tipo_sensor"];
                      const base = TIPO_BASE[n];
                      setDraftTipo({ ...draftTipo, nombre_tipo_sensor: n, unidades: base.unidades, decimales: base.decimales, imagen_tipo_sensor: base.img });
                    }}>
                      {(["temperatura","humedad","ph","radiacion"] as const).map(n => <SelectItem key={n}>{n}</SelectItem>)}
                    </Select>
                    <Input label="Unidades" value={draftTipo.unidades} onChange={e=>setDraftTipo({ ...draftTipo, unidades: e.target.value })}/>
                    <Input type="number" label="Decimales" value={String(draftTipo.decimales)} onChange={e=>setDraftTipo({ ...draftTipo, decimales: Number(e.target.value)||0 })}/>
                    <Input label="Imagen (URL)" value={draftTipo.imagen_tipo_sensor} onChange={e=>setDraftTipo({ ...draftTipo, imagen_tipo_sensor: e.target.value })} startContent={<ImgIcon size={16}/>}/>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={()=>setTipoAddOpen(false)}>Cancelar</Button>
                <Button color="primary" onClick={handleTipoAdd}>Registrar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={!!tipoDel} onOpenChange={()=>setTipoDel(null)}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Eliminar tipo de sensor</ModalHeader>
              <ModalBody>¿Eliminar <b>{tipoDel?.nombre_tipo_sensor}</b>? También se eliminarán sus sensores.</ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={()=>setTipoDel(null)}>Cancelar</Button>
                <Button color="danger" onClick={handleTipoDelete}>Eliminar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── Modales Sensores ─── */}
      <Modal isOpen={sensorEditOpen} onOpenChange={setSensorEditOpen} size="lg" scrollBehavior="inside">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Editar sensor</ModalHeader>
              <ModalBody>{draftSensor && <SensorForm draft={draftSensor} tipos={tipos} onChange={setDraftSensor} />}</ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={()=>setSensorEditOpen(false)}>Cancelar</Button>
                <Button color="primary" onClick={handleSensorSave}>Guardar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={sensorAddOpen} onOpenChange={setSensorAddOpen} size="lg" scrollBehavior="inside">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Registrar sensor</ModalHeader>
              <ModalBody>{draftSensor && <SensorForm draft={draftSensor} tipos={tipos} onChange={setDraftSensor} />}</ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={()=>setSensorAddOpen(false)}>Cancelar</Button>
                <Button color="primary" onClick={handleSensorAdd}>Registrar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={!!sensorDel} onOpenChange={()=>setSensorDel(null)}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Eliminar sensor</ModalHeader>
              <ModalBody>¿Eliminar <b>{sensorDel?.nombre_sensor}</b>?</ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={()=>setSensorDel(null)}>Cancelar</Button>
                <Button color="danger" onClick={handleSensorDelete}>Eliminar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Sub-componentes
   ────────────────────────────────────────────────────────────────────────── */
function SectionTitle({ title, ctaLabel, onCta }: { title: string; ctaLabel: string; onCta: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button color="primary" startContent={<Plus size={16}/>} onClick={onCta}>{ctaLabel}</Button>
    </div>
  );
}

function TipoTile({ tipo, onEdit, onDelete }: { tipo: TipoSensor; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="border border-default-200 hover:shadow-xl transition-shadow overflow-hidden">
      <div className="relative">
        <img src={tipo.imagen_tipo_sensor} alt={tipo.nombre_tipo_sensor} className="w-full h-36 object-cover" />
        <div className="absolute top-2 left-2">
          <Chip size="sm" color="primary" variant="solid" className="capitalize">{tipo.nombre_tipo_sensor}</Chip>
        </div>
      </div>
      <CardBody className="gap-2">
        <div className="text-sm text-default-500">Unidades</div>
        <div className="font-medium">{tipo.unidades}</div>
        <div className="text-sm text-default-500">Decimales</div>
        <div className="font-medium">{tipo.decimales}</div>
        <Divider />
        <ButtonGroup size="sm">
          <Button color="primary" startContent={<Edit3 size={14}/>} onClick={onEdit}>Editar</Button>
          <Button color="danger" variant="flat" startContent={<Trash2 size={14}/>} onClick={onDelete}>Eliminar</Button>
        </ButtonGroup>
      </CardBody>
    </Card>
  );
}

function SensorTile({ sensor, tipo, onEdit, onDelete }:{
  sensor: Sensor; tipo?: TipoSensor; onEdit: () => void; onDelete: () => void;
}) {
  const fallback = TIPO_BASE["temperatura"];
  const img = tipo?.imagen_tipo_sensor ?? fallback.img;
  const tipoName = tipo?.nombre_tipo_sensor ?? "—";
  const unidades = tipo?.unidades ?? "";
  return (
    <Card className="border border-default-200 hover:shadow-xl transition-shadow overflow-hidden">
      <div className="relative">
        <img src={img} alt={tipoName} className="w-full h-36 object-cover" />
        <div className="absolute top-2 left-2 flex gap-2">
          <Chip size="sm" color={sensor.activo ? "success" : "default"} variant="solid">
            {sensor.activo ? "Activo" : "Inactivo"}
          </Chip>
          <Chip size="sm" variant="flat" className="capitalize">{tipoName}</Chip>
        </div>
      </div>
      <CardBody className="gap-2">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold truncate" title={sensor.nombre_sensor}>{sensor.nombre_sensor}</div>
          <div className="text-xs text-default-500">Lote {sensor.id_lote_fk}</div>
        </div>
        <div className="text-xs"><b>Rango:</b> {sensor.valor_minimo} – {sensor.valor_maximo} {unidades}</div>
        <div className="text-xs"><b>Broker:</b> {sensor.broker}:{sensor.port}</div>
        <div className="text-xs truncate"><b>Topic:</b> {sensor.topic}</div>
        <div className="pt-2">
          <ButtonGroup size="sm">
            <Button color="primary" startContent={<Edit3 size={14}/>} onClick={onEdit}>Editar</Button>
            <Button color="danger" variant="flat" startContent={<Trash2 size={14}/>} onClick={onDelete}>Eliminar</Button>
          </ButtonGroup>
        </div>
      </CardBody>
    </Card>
  );
}

function SensorForm({ draft, tipos, onChange }:{ draft: Sensor; tipos: TipoSensor[]; onChange:(s:Sensor)=>void }) {
  const tipoActual = tipos.find(t => t.id_tipo_sensor_pk === draft.id_tipo_sensor_pk) ?? tipos[0];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Select
        label="Tipo"
        selectedKeys={[draft.id_tipo_sensor_pk]}
        onChange={(e) => {
          const t = tipos.find(tt => tt.id_tipo_sensor_pk === e.target.value) ?? tipos[0];
          onChange({ ...draft, id_tipo_sensor_pk: t.id_tipo_sensor_pk, topic: `agrotech/lote-${draft.id_lote_fk}/${t.nombre_tipo_sensor}` });
        }}
      >
        {tipos.map(t => <SelectItem key={t.id_tipo_sensor_pk} className="capitalize">{t.nombre_tipo_sensor}</SelectItem>)}
      </Select>
      <Select
        label="Lote"
        selectedKeys={[draft.id_lote_fk]}
        onChange={(e) => {
          const lote = e.target.value as LoteId;
          onChange({ ...draft, id_lote_fk: lote, topic: `agrotech/lote-${lote}/${tipoActual.nombre_tipo_sensor}` });
        }}
      >
        {LOTES.map(l => <SelectItem key={l}>Lote {l}</SelectItem>)}
      </Select>
      <Input label="Nombre" value={draft.nombre_sensor} onChange={e=>onChange({ ...draft, nombre_sensor: e.target.value })}/>
      <Input label="Broker" value={draft.broker} onChange={e=>onChange({ ...draft, broker: e.target.value })}/>
      <Input type="number" label="Port" value={String(draft.port)} onChange={e=>onChange({ ...draft, port: Number(e.target.value)||0 })}/>
      <Input label="Topic" value={draft.topic} onChange={e=>onChange({ ...draft, topic: e.target.value })}/>
      <Input type="number" label="Valor mínimo" value={String(draft.valor_minimo)} onChange={e=>onChange({ ...draft, valor_minimo: Number(e.target.value)||0 })}/>
      <Input type="number" label="Valor máximo" value={String(draft.valor_maximo)} onChange={e=>onChange({ ...draft, valor_maximo: Number(e.target.value)||0 })}/>
      <div className="flex items-center gap-3">
        <span className="text-sm text-default-500">Activo</span>
        <Switch isSelected={draft.activo} onValueChange={(v)=>onChange({ ...draft, activo: v })}/>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Gráficas por lote — full-width con carrusel y autoscroll (20s)
   SIN animaciones dentro de las gráficas
   ────────────────────────────────────────────────────────────────────────── */
function LoteRow({ lote, sensores, tipos, series }:{
  lote: LoteId; sensores: Sensor[]; tipos: TipoSensor[]; series: Record<string, Punto[]>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tipoMap = useMemo(() => Object.fromEntries(tipos.map(t => [t.id_tipo_sensor_pk, t])), [tipos]);

  const ordered: Array<{ sensor: Sensor | null; tipo: TipoSensor["nombre_tipo_sensor"] }> = [
    { sensor: sensores.find(s => tipoMap[s.id_tipo_sensor_pk]?.nombre_tipo_sensor === "temperatura") || null, tipo: "temperatura" },
    { sensor: sensores.find(s => tipoMap[s.id_tipo_sensor_pk]?.nombre_tipo_sensor === "humedad") || null,     tipo: "humedad" },
    { sensor: sensores.find(s => tipoMap[s.id_tipo_sensor_pk]?.nombre_tipo_sensor === "ph") || null,          tipo: "ph" },
    { sensor: sensores.find(s => tipoMap[s.id_tipo_sensor_pk]?.nombre_tipo_sensor === "radiacion") || null,   tipo: "radiacion" },
  ];

  const scrollBy = (dir: "left"|"right") => {
    const el = containerRef.current; if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: dir==="right" ? w : -w, behavior: "smooth" });
  };

  // autoscroll 20s
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const timer = setInterval(() => {
      const atEnd = Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth, behavior: "smooth" });
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex items-center justify-between">
        <div className="text-lg font-semibold">Lote {lote}</div>
        <ButtonGroup>
          <Tooltip content="Anterior"><Button isIconOnly variant="flat" onClick={()=>scrollBy("left")}><ChevronLeft/></Button></Tooltip>
          <Tooltip content="Siguiente"><Button isIconOnly onClick={()=>scrollBy("right")}><ChevronRight/></Button></Tooltip>
        </ButtonGroup>
      </CardHeader>
      <CardBody>
        <div ref={containerRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2" style={{ scrollBehavior: "smooth" }}>
          {ordered.map(({ sensor, tipo }) => (
            <div key={tipo + (sensor?.id_sensor_pk ?? "empty")} className="min-w-full snap-start">
              <MetricChart
                tipo={tipo}
                sensor={sensor}
                tipoDef={TIPO_BASE[tipo]}
                series={sensor ? series[sensor.id_sensor_pk] ?? [] : []}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function MetricChart({ tipo, sensor, tipoDef, series }:{
  tipo: TipoSensor["nombre_tipo_sensor"];
  sensor: Sensor | null;
  tipoDef: { color: string; gradId: string; unidades: string };
  series: Punto[];
}) {
  const data = useMemo(() => series.map(p => ({ t: new Date(p.ts).toLocaleTimeString(), v: p.value })), [series]);
  const last = data.at(-1)?.v ?? null;

  // Umbrales visibles en la gráfica (banda + líneas)
  const vmin = sensor?.valor_minimo ?? undefined;
  const vmax = sensor?.valor_maximo ?? undefined;

  return (
    <Card className="border border-default-200 hover:shadow-lg transition-shadow">
      <CardHeader className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold capitalize">{tipo}</div>
          <div className="text-xs text-default-500 truncate" title={sensor ? sensor.nombre_sensor : "Sin sensor configurado"}>
            {sensor ? sensor.nombre_sensor : "Sin sensor configurado"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            {last != null ? `${Number(last).toFixed(2)} ${tipoDef.unidades}` : "—"}
          </Chip>
          {sensor && (
            <Chip size="sm" variant="flat" className="hidden sm:flex">
              {sensor.broker}:{sensor.port}
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <div className="w-full h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={tipoDef.gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={tipoDef.color} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={tipoDef.color} stopOpacity={0}/>
                </linearGradient>
              </defs>

              {/* Banda de umbrales (si hay) */}
              {vmin != null && vmax != null && vmax > vmin && (
                <ReferenceArea y1={vmin} y2={vmax} fill={tipoDef.color} fillOpacity={0.06} />
              )}
              {vmin != null && <ReferenceLine y={vmin} stroke={tipoDef.color} strokeDasharray="4 4" />}
              {vmax != null && <ReferenceLine y={vmax} stroke={tipoDef.color} strokeDasharray="4 4" />}

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" minTickGap={28} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <RTooltip
                formatter={(val: number) => [`${val} ${tipoDef.unidades}`, "Valor"]}
                labelFormatter={(l) => `Hora: ${l}`}
              />

              {/* SIN ANIMACIONES */}
              <Area
                type="monotone"
                dataKey="v"
                stroke={tipoDef.color}
                fill={`url(#${tipoDef.gradId})`}
                connectNulls
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
