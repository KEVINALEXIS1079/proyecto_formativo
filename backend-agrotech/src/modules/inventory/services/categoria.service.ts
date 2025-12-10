import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepo: Repository<Categoria>,
  ) {}

  async create(data: { nombre: string; descripcion?: string }) {
    const categoria = this.categoriaRepo.create(data);
    return this.categoriaRepo.save(categoria);
  }

  async findAll() {
    return this.categoriaRepo.find({
      relations: ['insumos'],
    });
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id },
      relations: ['insumos'],
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }

    return categoria;
  }

  async update(id: number, data: { nombre?: string; descripcion?: string }) {
    const categoria = await this.findOne(id);
    Object.assign(categoria, data);
    return this.categoriaRepo.save(categoria);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    return this.categoriaRepo.softRemove(categoria);
  }
}