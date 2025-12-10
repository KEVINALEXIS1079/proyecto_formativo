import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../entities/proveedor.entity';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedorRepo: Repository<Proveedor>,
  ) {}

  async create(data: { nombre: string }) {
    const proveedor = this.proveedorRepo.create(data);
    return this.proveedorRepo.save(proveedor);
  }

  async findAll() {
    return this.proveedorRepo.find({
      relations: ['insumos'],
    });
  }

  async findOne(id: number) {
    const proveedor = await this.proveedorRepo.findOne({
      where: { id },
      relations: ['insumos'],
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }

    return proveedor;
  }

  async update(id: number, data: { nombre?: string }) {
    const proveedor = await this.findOne(id);
    Object.assign(proveedor, data);
    return this.proveedorRepo.save(proveedor);
  }

  async remove(id: number) {
    const proveedor = await this.findOne(id);
    if (proveedor.insumos && proveedor.insumos.length > 0) {
      throw new BadRequestException('No se puede eliminar el proveedor porque tiene insumos asociados.');
    }
    return this.proveedorRepo.softRemove(proveedor);
  }
}