import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';

@Injectable()
export class DepreciationService {
    constructor(
        @InjectRepository(Insumo) private insumoRepo: Repository<Insumo>
    ) { }

    /**
     * Calcula la depreciación por hora/uso basada en el método de unidades de producción
     */
    calcularDepreciacionPorUso(
        costoAdquisicion: number,
        valorResidual: number,
        vidaUtilHoras: number
    ): number {
        if (vidaUtilHoras <= 0) return 0;
        return (costoAdquisicion - valorResidual) / vidaUtilHoras;
    }

    /**
     * Registra uso de activo fijo y calcula depreciación
     */
    async registrarUsoActivo(
        insumoId: number,
        horasUsadas: number
    ): Promise<{
        depreciacionGenerada: number;
        depreciacionAcumulada: number;
        valorEnLibros: number;
        insumo: Insumo;
    }> {
        const insumo = await this.insumoRepo.findOne({ where: { id: insumoId } });

        if (!insumo) {
            throw new BadRequestException(`Insumo ${insumoId} no encontrado`);
        }

        if (insumo.tipoInsumo !== 'NO_CONSUMIBLE') {
            throw new BadRequestException('Solo aplica para activos fijos (NO_CONSUMIBLE)');
        }

        // Calcular depreciación por este uso
        const depreciacionPorUso = this.calcularDepreciacionPorUso(
            insumo.costoAdquisicion || 0,
            insumo.valorResidual || 0,
            insumo.vidaUtilHoras || 1
        );

        const depreciacionGenerada = depreciacionPorUso * horasUsadas;

        // Actualizar activo
        insumo.horasUsadas = (insumo.horasUsadas || 0) + horasUsadas;
        insumo.depreciacionAcumulada = (insumo.depreciacionAcumulada || 0) + depreciacionGenerada;

        // Calcular valor en libros actual
        const valorEnLibros = (insumo.costoAdquisicion || 0) - insumo.depreciacionAcumulada;
        // Actualizar también el campo valorInventario para consistencia
        insumo.valorInventario = Math.max(0, valorEnLibros);

        // Verificar si llegó al final de vida útil
        const vidaUtil = insumo.vidaUtilHoras || 0;
        if (vidaUtil > 0 && insumo.horasUsadas >= vidaUtil) {
            insumo.estado = 'DADO_DE_BAJA';
            if (!insumo.fechaBaja) {
                insumo.fechaBaja = new Date();
            }
        } else if (insumo.estado === 'DISPONIBLE') {
            insumo.estado = 'EN_USO'; // Marcar como usado al menos una vez
        }

        await this.insumoRepo.save(insumo);

        return {
            depreciacionGenerada,
            depreciacionAcumulada: insumo.depreciacionAcumulada,
            valorEnLibros,
            insumo
        };
    }

    /**
     * Obtiene el valor actual en libros de un activo
     */
    getValorEnLibros(insumo: Insumo): number {
        if (insumo.tipoInsumo !== 'NO_CONSUMIBLE') {
            return insumo.valorInventario;
        }
        return (insumo.costoAdquisicion || 0) - (insumo.depreciacionAcumulada || 0);
    }

    /**
     * Calcula porcentaje de vida útil restante
     */
    getPorcentajeVidaUtil(insumo: Insumo): number {
        if (insumo.tipoInsumo !== 'NO_CONSUMIBLE') {
            return 100;
        }
        const vidaUtil = insumo.vidaUtilHoras || 1;
        const horasRestantes = vidaUtil - (insumo.horasUsadas || 0);
        return Math.max(0, (horasRestantes / vidaUtil) * 100);
    }
}
