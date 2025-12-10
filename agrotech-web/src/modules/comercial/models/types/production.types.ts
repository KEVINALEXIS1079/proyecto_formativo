
export interface ProductoAgro {
    id: number;
    nombre: string;
    unidadBase: string;
    descripcion?: string;
}

export interface LoteProduccion {
    id: number;
    productoAgroId: number;
    cultivoId?: number;
    loteId?: number;
    subLoteId?: number;
    actividadCosechaId?: number;
    calidad: string;
    cantidadKg: number;
    stockDisponibleKg: number;
    costoUnitarioKg: number;
    costoTotal: number;
    precioSugeridoKg: number;

    productoAgro?: ProductoAgro;
    cultivo?: any; // Replace with Cultivo type if available
}

export interface CreateProductoAgroDto {
    nombre: string;
    unidadBase: string;
    descripcion?: string;
}

export interface CreateLoteProduccionDto {
    productoAgroId: number;
    cultivoId?: number;
    calidad?: string;
    cantidadKg: number;
    costoUnitarioKg: number;
    precioSugeridoKg: number;
}

export interface UpdateLoteProduccionDto {
    calidad?: string;
    stockDisponibleKg?: number;
    precioSugeridoKg?: number;
}
