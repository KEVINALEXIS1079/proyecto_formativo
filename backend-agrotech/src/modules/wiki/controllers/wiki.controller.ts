import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe, ParseIntPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { WikiService } from '../services/wiki.service';
import { CreateEpaDto } from '../dtos/create-epa.dto';
import { UpdateEpaDto } from '../dtos/update-epa.dto';
import { TipoEpa } from '../entities/tipo-epa.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('epas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WikiController {
  constructor(
    private readonly wikiService: WikiService,
    @InjectRepository(TipoEpa)
    private readonly tipoEpaRepo: Repository<TipoEpa>,
  ) {}

  // Internal method for WebSocket: handles finding all EPAs with optional filters by calling the service
  // Flow: Gateway calls this method -> calls wikiService.findAll -> returns EPA list
  async findAll(filters?: any) {
    return this.wikiService.findAll(filters);
  }

  // Internal method for WebSocket: handles finding an EPA by ID by calling the service
  // Flow: Gateway calls this method -> calls wikiService.findOne -> returns EPA
  async findOne(id: number) {
    return this.wikiService.findOne(id);
  }

  // Internal method for WebSocket: handles creating an EPA by calling the service
  // Flow: Gateway calls this method -> calls wikiService.create -> returns created EPA
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(createEpaDto: CreateEpaDto, userId?: number) {
    return this.wikiService.create(createEpaDto, userId);
  }

  // Internal method for WebSocket: handles updating an EPA by calling the service
  // Flow: Gateway calls this method -> calls wikiService.update -> returns updated EPA
  @UsePipes(new ValidationPipe())
  async update(id: number, updateEpaDto: UpdateEpaDto) {
    return this.wikiService.update(id, updateEpaDto);
  }

  // Internal method for WebSocket: handles removing an EPA by calling the service
  // Flow: Gateway calls this method -> calls wikiService.remove -> returns removed EPA
  async remove(id: number) {
    return this.wikiService.remove(id);
  }

  // Internal method for WebSocket: handles finding all crop types by calling the service
  // Flow: Gateway calls this method -> calls wikiService.findAllTiposCultivo -> returns crop types list
  async findAllTiposCultivo() {
    return this.wikiService.findAllTiposCultivo();
  }

  // ==================== HTTP ENDPOINTS ====================

  @Post()
  @RequirePermissions('wiki.crear')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'fotosSintomas', maxCount: 10 },
    { name: 'fotosGenerales', maxCount: 10 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/epas';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEpaHttp(
    @Body() createEpaDto: CreateEpaDto,
    @UploadedFiles() files: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] },
    @Req() req: Request
  ) {
    const userId = (req?.user as any)?.id ?? (req?.user as any)?.userId ?? 1;

    // Populate fotosSintomas and fotosGenerales with file paths
    if (files?.fotosSintomas) {
      createEpaDto.fotosSintomas = files.fotosSintomas.map(file => file.path.replace(/\\/g, '/'));
    }
    if (files?.fotosGenerales) {
      createEpaDto.fotosGenerales = files.fotosGenerales.map(file => file.path.replace(/\\/g, '/'));
    }

    return this.create(createEpaDto, userId);
  }

  @Get()
  @RequirePermissions('wiki.ver')
  async findAllEpasHttp(
    @Query('q') q?: string,
    @Query('tipoId') tipoId?: number,
    @Query('tipoCultivoEpaId') tipoCultivoEpaId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    console.log('Query parameters - q:', q, 'tipoId:', tipoId, 'tipoCultivoEpaId:', tipoCultivoEpaId);
    let tipoEpa: string | undefined;
    if (tipoId) {
      const tipoEpaEntity = await this.tipoEpaRepo.findOne({ where: { id: tipoId } });
      if (tipoEpaEntity) {
        tipoEpa = tipoEpaEntity.tipoEpaEnum;
      }
    }
    const options = { q, tipoEpa, tipoCultivoWikiId: tipoCultivoEpaId };
    console.log('Options object:', options);
    return this.findAll(options);
  }

  @Get(':id')
  @RequirePermissions('wiki.ver')
  async findOneEpaHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('wiki.editar')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'fotosSintomas', maxCount: 10 },
    { name: 'fotosGenerales', maxCount: 10 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/epas';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateEpaHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEpaDto: UpdateEpaDto,
    @UploadedFiles() files: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }
  ) {
    console.log('=== CONTROLLER UPDATE DEBUG ===');
    console.log('ID:', id);
    console.log('Body received:', JSON.stringify(updateEpaDto, null, 2));

    // Populate fotosSintomas and fotosGenerales with file paths
    if (files?.fotosSintomas) {
      updateEpaDto.fotosSintomas = files.fotosSintomas.map(file => file.path.replace(/\\/g, '/'));
    }
    if (files?.fotosGenerales) {
      updateEpaDto.fotosGenerales = files.fotosGenerales.map(file => file.path.replace(/\\/g, '/'));
    }

    return this.update(id, updateEpaDto);
  }

  @Delete(':id')
  @RequirePermissions('wiki.eliminar')
  async removeEpaHttp(@Param('id', ParseIntPipe) id: number) {
    return this.remove(id);
  }
}
