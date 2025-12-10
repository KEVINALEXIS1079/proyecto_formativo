import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Almacen } from '../entities/almacen.entity';

@Injectable()
export class AlmacenService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,
  ) {}

  async create(data: { nombre: string; descripcion?: string; ubicacion?: string }) {
    const almacen = this.almacenRepo.create(data);
    return this.almacenRepo.save(almacen);
  }

  async findAll() {
    return this.almacenRepo.find({
      relations: ['insumos'],
    });
  }

  async findOne(id: number) {
    const almacen = await this.almacenRepo.findOne({
      where: { id },
      relations: ['insumos'],
    });

    if (!almacen) {
      throw new NotFoundException(`Almacén ${id} no encontrado`);
    }

    return almacen;
  }

  async update(id: number, data: { nombre?: string; descripcion?: string; ubicacion?: string }) {
    const almacen = await this.findOne(id);
    Object.assign(almacen, data);
    return this.almacenRepo.save(almacen);
  }

  async remove(id: number) {
    const almacen = await this.findOne(id);
    if (almacen.insumos && almacen.insumos.length > 0) {
      throw new BadRequestException('No se puede eliminar el almacén porque tiene insumos asociados.');
    }
    return this.almacenRepo.softRemove(almacen);
  }
}