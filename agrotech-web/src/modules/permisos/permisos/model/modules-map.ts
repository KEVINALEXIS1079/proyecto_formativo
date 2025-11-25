// ===============================
// Helpers de normalización (mejorados)
// ===============================
function titleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function splitSlug(raw?: string) {
  if (!raw) return [] as string[];
  return String(raw).trim().split(/[:./]+/).map((x) => x.trim()).filter(Boolean);
}

/** Pluralización súper simple en ES para etiquetas */
function pluralizeEs(word: string) {
  const w = word.trim();
  if (!w) return w;
  if (/\b.+(es|s)\b$/i.test(w)) return w; // ya parece plural
  if (/[aeiou]$/i.test(w)) return w + "s";
  if (/z$/i.test(w)) return w.slice(0, -1) + "ces";
  return w + "es";
}

/** Intenta extraer el slug desde MUCHAS variantes y anidados */
function extractSlug(p: any): string {
  if (!p) return "";
  if (typeof p === "string") return p;

  const directCandidates = [
    p?.permisoCompleto,
    p?.permiso_completo,
    p?.permiso,
    p?.key,
    p?.slug,
    p?.nombre_permiso,
    p?.path,
    p?.nombre, // a veces llega así
    p?.label,
  ];

  const nestedCandidates = [
    p?.permiso?.permisoCompleto,
    p?.permiso?.slug,
    p?.data?.permiso,
    p?.attributes?.slug,
  ];

  for (const v of [...directCandidates, ...nestedCandidates]) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }

  // Escaneo de respaldo: la primera propiedad string que tenga “:”
  for (const [, v] of Object.entries(p)) {
    if (typeof v === "string" && v.includes(":")) return v.trim();
  }

  return "";
}

/** "actividad:evidencias" → "Evidencias" */
export function normalizeModuleSlug(raw?: string): string {
  if (!raw) return "";
  const parts = splitSlug(raw);
  const tail = parts[parts.length - 1] || "";
  return titleCase(tail);
}

// ===============================
// Mapas base (tal cual los tenías)
// ===============================
export const MODULE_NAME_OVERRIDES: Record<number, string> = {
  2: "Actividades",
  3: "Actividad de Cultivo",
  4: "Actividad - Evidencias",
  5: "Actividad - Tipos",
  6: "Actividad por Usuario",
  8: "Cultivos",
  9: "Lotes",
  10: "Sublotes",
  11: "Tipos de Cultivo",
  13: "Movimientos (Finanzas)",
  14: "Productos (Finanzas)",
  15: "Ventas",
  17: "EPAS",
  18: "Tipos de EPAS",
  20: "Almacenes",
  21: "Categorías",
  22: "Insumos ↔ Proveedor",
  23: "Insumos",
  24: "Movimientos (Inventario)",
  26: "Sensores IoT",
  27: "Tipos de Sensores",
  29: "Roles",
  30: "Usuarios",
};

export const ACTION_LABELS: Record<string, string> = {
  read: "Ver",
  list: "Ver",
  create: "Crear",
  update: "Editar",
  delete: "Eliminar",
};

export const PERMISO_LABEL_OVERRIDES: Record<string, string> = {
  // "actividad:evidencias:read": "Ver evidencias",
};

/** Nombres “sustantivo” por módulo (singular) */
export const RESOURCE_NOUN_OVERRIDES: Record<number, string> = {
  5: "Tipo de Actividad",
  27: "Tipo de Sensor",
  21: "Categoría",
  23: "Insumo",
  14: "Producto (Finanzas)",
};

// ===============================
// Detección de módulo/acción/recurso
// ===============================
function detectModuleId(p: any): number | null {
  const raw =
    p?.module?.id ??
    p?.module?.id_permiso_module_pk ??
    p?.moduleId ??
    p?.module_id ??
    null;
  const id = Number(raw);
  return !id || Number.isNaN(id) ? null : id;
}

function getActionKey(p: any): string {
  const full = extractSlug(p);
  const rawAction =
    p?.accion ??
    p?.action ??
    p?.nombre_accion ??
    (full ? splitSlug(full).slice(-1)[0] : "");
  return String(rawAction || "").toLowerCase().trim();
}

/** Recurso legible a partir del permiso; usa map/overrides si se puede */
export function getPermResource(p: any, map?: Record<number, string>): string {
  // 1) Por id de módulo
  const mid = detectModuleId(p);
  if (mid) {
    if (RESOURCE_NOUN_OVERRIDES[mid]) return RESOURCE_NOUN_OVERRIDES[mid];
    if (map?.[mid]) return map[mid];
    if (MODULE_NAME_OVERRIDES[mid]) return MODULE_NAME_OVERRIDES[mid];
  }

  // 2) Por nombre presente en el objeto
  const fromModuleName =
    p?.module?.nombre ??
    p?.module?.name ??
    p?.modulo ??
    p?.recurso ??
    "";
  if (fromModuleName) return normalizeModuleSlug(fromModuleName);

  // 3) Inferido desde el slug (penúltima parte)
  const full = extractSlug(p);
  const parts = splitSlug(full);
  if (parts.length >= 2) return normalizeModuleSlug(parts[parts.length - 2]);
  if (parts.length === 1) return normalizeModuleSlug(parts[0]);

  return "";
}

// ===============================
// Construcción automática desde API
// ===============================
export function buildModuleMapFromPermisos(permisos: any[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const p of permisos || []) {
    const id = detectModuleId(p);
    if (!id) continue;

    if (MODULE_NAME_OVERRIDES[id]) {
      map[id] = MODULE_NAME_OVERRIDES[id];
      continue;
    }

    const rawName =
      p?.module?.nombre ??
      p?.module?.name ??
      p?.modulo ??
      "";
    if (!rawName) continue;

    map[id] = normalizeModuleSlug(rawName);
  }

  if (Object.keys(map).length === 0) return { ...MODULE_NAME_OVERRIDES };
  return map;
}

export function getModuleLabelFromMap(id?: number | null, map?: Record<number, string>) {
  if (!id) return "Todos";
  if (map?.[id]) return map[id];
  if (MODULE_NAME_OVERRIDES[id]) return MODULE_NAME_OVERRIDES[id];
  return `Módulo ${id}`;
}

export function moduleOptionsFromMap(map: Record<number, string>) {
  return Object.entries(map)
    .map(([id, nombre]) => ({ id: Number(id), nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/** Si llega un slug crudo, lo volvemos “Acción Recurso” sí o sí */
function prettifyFromSlug(slug: string): string {
  const parts = splitSlug(slug);
  if (parts.length === 0) return "";

  const actionKey = (parts[parts.length - 1] || "").toLowerCase();
  const action = ACTION_LABELS[actionKey] || titleCase(actionKey);

  const resourceRaw = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  const resource = normalizeModuleSlug(resourceRaw);

  return [action, resource].filter(Boolean).join(" ").trim();
}

/** Etiqueta bonita para cada permiso (usa moduleMap si se lo pasas) */
export function buildPermisoLabel(p: any, map?: Record<number, string>): string {
  const overrideKey = extractSlug(p);
  if (overrideKey && PERMISO_LABEL_OVERRIDES[overrideKey]) {
    return PERMISO_LABEL_OVERRIDES[overrideKey];
  }

  const actionKey = getActionKey(p);
  const action = ACTION_LABELS[actionKey] || (actionKey ? titleCase(actionKey) : "");

  // Recurso base
  let resource = getPermResource(p, map);

  // Pluralizar si es “Ver/Listar”
  if (actionKey === "read" || actionKey === "list") {
    resource = pluralizeEs(resource);
  }

  const composed = [action, resource].filter(Boolean).join(" ").trim();
  if (composed) return composed;

  if (overrideKey && overrideKey.includes(":")) {
    const pretty = prettifyFromSlug(overrideKey);
    if (pretty) return pretty;
  }

  return p?.nombre || p?.label || overrideKey || "Permiso";
}
