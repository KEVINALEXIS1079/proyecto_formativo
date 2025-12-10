import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, ParseIntPipe, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CultivosService } from '../services/cultivos.service';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('cultivos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CultivosController {
  constructor(private readonly cultivosService: CultivosService) {}

  // ==================== HTTP ENDPOINTS ====================

  @Post()
  @RequirePermissions('cultivos.crear')
  @UseInterceptors(FileInterceptor('img', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/cultivos';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cultivo-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  @UsePipes(new ValidationPipe())
  async createCultivoHttp(@Body() dto: CreateCultivoDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      dto.imgCultivo = file.path.replace(/\\/g, '/');
    }
    return this.createCultivo(dto);
  }

  @Get()
  @RequirePermissions('cultivos.ver')
  async findAllCultivosHttp(
    @Query('q') q?: string,
    @Query('loteId') loteId?: string,
    @Query('subLoteId') subLoteId?: string,
    @Query('estado') estado?: string,
    @Query('tipoCultivo') tipoCultivo?: string,
  ) {
    const filters: any = {};
    if (q) filters.q = q;
    if (estado) filters.estado = estado;
    if (tipoCultivo) filters.tipoCultivo = tipoCultivo;
    if (loteId) filters.loteId = Number(loteId);
    if (subLoteId) filters.subLoteId = Number(subLoteId);
    return this.findAllCultivos(filters);
  }

  @Get('historial')
  @RequirePermissions('cultivos.ver')
  async listHistorial(@Query('limit') limit?: string, @Query('cultivoId') cultivoId?: string) {
    return this.cultivosService.listHistorial(limit ? Number(limit) : 50, cultivoId ? Number(cultivoId) : undefined);
  }

  @Get(':id')
  @RequirePermissions('cultivos.ver')
  async findOneCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findCultivoById(id);
  }

  @Patch(':id')
  @RequirePermissions('cultivos.editar')
  @UseInterceptors(FileInterceptor('img', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/cultivos';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cultivo-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  @UsePipes(new ValidationPipe())
  async updateCultivoHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCultivoDto, @Req() req: any, @UploadedFile() file?: Express.Multer.File) {
    const usuarioId = req?.user?.sub ?? req?.user?.id;
    // Normalizar strings vacías provenientes de FormData a null
    if ((dto as any).subLoteId === '') dto.subLoteId = null as any;
    if ((dto as any).loteId === '') dto.loteId = null as any;

    if (file) {
      dto.imgCultivo = file.path.replace(/\\/g, '/');
    }
    return this.updateCultivo(id, dto, usuarioId);
  }

  @Delete(':id')
  @RequirePermissions('cultivos.eliminar')
  async removeCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeCultivo(id);
  }

  // ==================== INTERNAL METHODS ====================

  // Internal method for WebSocket: handles finding all cultivos with filters by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.findAllCultivos -> returns cultivos list
  async findAllCultivos(filters?: any) {
    return this.cultivosService.findAllCultivos(filters);
  }

  // Internal method for WebSocket: handles finding a cultivo by ID by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.findCultivoById -> returns cultivo
  async findCultivoById(id: number) {
    return this.cultivosService.findCultivoById(id);
  }

  // Internal method for WebSocket: handles creating a cultivo by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.createCultivo -> returns created cultivo
  @UsePipes(new ValidationPipe())
  async createCultivo(createCultivoDto: CreateCultivoDto) {
    return this.cultivosService.createCultivo(createCultivoDto);
  }

  // Internal method for WebSocket: handles updating a cultivo by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.updateCultivo -> returns updated cultivo
  @UsePipes(new ValidationPipe())
  async updateCultivo(id: number, data: UpdateCultivoDto, usuarioId?: number) {
    return this.cultivosService.updateCultivo(id, data, usuarioId);
  }

  // Internal method for WebSocket: handles removing a cultivo by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.removeCultivo -> returns removed cultivo
  async removeCultivo(id: number) {
    return this.cultivosService.removeCultivo(id);
  }
}
