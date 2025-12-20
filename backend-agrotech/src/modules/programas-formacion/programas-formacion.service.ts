import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProgramaFormacion } from './entities/programa-formacion.entity';
import { TipoFormacion } from './entities/tipo-formacion.entity';
import { CreateProgramaFormacionDto } from './dtos/create-programa-formacion.dto';
import { UpdateProgramaFormacionDto } from './dtos/update-programa-formacion.dto';

@Injectable()
export class ProgramasFormacionService {
    constructor(
        @InjectRepository(ProgramaFormacion)
        private programaRepo: Repository<ProgramaFormacion>,
        @InjectRepository(TipoFormacion)
        private tipoRepo: Repository<TipoFormacion>,
    ) { }

    async findAll(filters?: {
        tipo?: string;
        estado?: string;
        q?: string;
    }) {
        const where: any = {};

        if (filters?.tipo) where.tipo = filters.tipo;
        if (filters?.estado) where.estado = filters.estado;
        if (filters?.q) {
            return this.programaRepo.find({
                where: [
                    { numeroFicha: Like(`%${filters.q}%`), ...where },
                    { nombre: Like(`%${filters.q}%`), ...where },
                ],
                relations: ['usuarios'],
                order: { createdAt: 'DESC' },
            });
        }

        return this.programaRepo.find({
            where,
            relations: ['usuarios'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number) {
        const programa = await this.programaRepo.findOne({
            where: { id },
            relations: ['usuarios', 'usuarios.rol'],
        });

        if (!programa) {
            throw new NotFoundException(`Programa de formación con ID ${id} no encontrado`);
        }

        return programa;
    }

    async findByNumeroFicha(numeroFicha: string) {
        return this.programaRepo.findOne({
            where: { numeroFicha },
        });
    }

    async create(dto: CreateProgramaFormacionDto) {
        // Verificar que no exista ya
        const existing = await this.findByNumeroFicha(dto.numeroFicha);
        if (existing) {
            throw new BadRequestException(`Ya existe un programa con la ficha ${dto.numeroFicha}`);
        }

        const programa = this.programaRepo.create(dto);
        return this.programaRepo.save(programa);
    }

    async update(id: number, dto: UpdateProgramaFormacionDto) {
        const programa = await this.findOne(id);

        // Si cambia el número de ficha, verificar que no exista
        if (dto.numeroFicha && dto.numeroFicha !== programa.numeroFicha) {
            const existing = await this.findByNumeroFicha(dto.numeroFicha);
            if (existing) {
                throw new BadRequestException(`Ya existe un programa con la ficha ${dto.numeroFicha}`);
            }
        }

        Object.assign(programa, dto);
        return this.programaRepo.save(programa);
    }

    async remove(id: number) {
        const programa = await this.findOne(id);

        // Verificar que no tenga usuarios asignados
        if (programa.cantidadAprendices > 0) {
            throw new BadRequestException(
                'No se puede eliminar un programa con usuarios asignados'
            );
        }

        await this.programaRepo.remove(programa);
        return { message: 'Programa eliminado exitosamente' };
    }

    async getTiposFormacion() {
        return this.tipoRepo.find({
            where: { activo: true },
            order: { orden: 'ASC' },
        });
    }

    async updateCantidadAprendices(programaId: number) {
        const programa = await this.findOne(programaId);
        programa.cantidadAprendices = programa.usuarios?.length || 0;
        await this.programaRepo.save(programa);
    }
}
