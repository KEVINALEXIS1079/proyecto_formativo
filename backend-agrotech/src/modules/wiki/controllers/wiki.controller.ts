import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, ParseIntPipe, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { WikiService } from '../services/wiki.service';
import { CreateEpaDto } from '../dtos/create-epa.dto';
import { UpdateEpaDto } from '../dtos/update-epa.dto';
import { CreateTipoCultivoWikiDto } from '../dtos/create-tipo-cultivo-wiki.dto';
import { UpdateTipoCultivoWikiDto } from '../dtos/update-tipo-cultivo-wiki.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('epas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

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
  @UsePipes(new ValidationPipe())
  async create(createEpaDto: CreateEpaDto, files?: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }) {
    return this.wikiService.create(createEpaDto, files);
  }

  // Internal method for WebSocket: handles updating an EPA by calling the service
  // Flow: Gateway calls this method -> calls wikiService.update -> returns updated EPA
  @UsePipes(new ValidationPipe())
  async update(id: number, updateEpaDto: UpdateEpaDto, files?: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }) {
    return this.wikiService.update(id, updateEpaDto, files);
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
  ]))
  @UsePipes(new ValidationPipe())
  async createEpaHttp(@Body() createEpaDto: CreateEpaDto, @UploadedFiles() files: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }) {
    return this.create(createEpaDto, files);
  }

  @Get()
  @RequirePermissions('wiki.ver')
  async findAllEpasHttp(
    @Query('q') q?: string,
    @Query('tipoEpa') tipoEpa?: string,
    @Query('tipoCultivoWikiId') tipoCultivoWikiId?: number,
    @Query('mes') mes?: number,
    @Query('temporada') temporada?: string,
    @Query('conFotos') conFotos?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: string,
  ) {
    const filters = { q, tipoEpa, tipoCultivoWikiId, mes, temporada, conFotos };
    const pagination = { page, limit, orderBy, orderDir };
    return this.wikiService.findAllPaginated(filters, pagination);
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
  ]))
  @UsePipes(new ValidationPipe())
  async updateEpaHttp(@Param('id', ParseIntPipe) id: number, @Body() updateEpaDto: UpdateEpaDto, @UploadedFiles() files: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }) {
    return this.update(id, updateEpaDto, files);
  }

  @Delete(':id')
  @RequirePermissions('wiki.eliminar')
  async removeEpaHttp(@Param('id', ParseIntPipe) id: number) {
    return this.remove(id);
  }

  // ==================== CRUD TIPO CULTIVO WIKI ====================

  @Get('tipos-cultivo')
  @RequirePermissions('wiki.ver')
  async findAllTiposCultivoHttp() {
    return this.findAllTiposCultivo();
  }

  @Post('tipos-cultivo')
  @RequirePermissions('wiki.crear')
  @UsePipes(new ValidationPipe())
  async createTipoCultivoHttp(@Body() createTipoCultivoWikiDto: CreateTipoCultivoWikiDto) {
    return this.wikiService.createTipoCultivo(createTipoCultivoWikiDto);
  }

  @Patch('tipos-cultivo/:id')
  @RequirePermissions('wiki.editar')
  @UsePipes(new ValidationPipe())
  async updateTipoCultivoHttp(@Param('id', ParseIntPipe) id: number, @Body() updateTipoCultivoWikiDto: UpdateTipoCultivoWikiDto) {
    return this.wikiService.updateTipoCultivo(id, updateTipoCultivoWikiDto);
  }

  @Delete('tipos-cultivo/:id')
  @RequirePermissions('wiki.eliminar')
  async removeTipoCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.removeTipoCultivo(id);
  }

  // ==================== RELACIONES EPA ↔ TIPO CULTIVO ====================

  @Post(':epaId/tipos-cultivo/:tipoId')
  @RequirePermissions('wiki.editar')
  async associateEpaToTipoCultivoHttp(@Param('epaId', ParseIntPipe) epaId: number, @Param('tipoId', ParseIntPipe) tipoId: number) {
    return this.wikiService.associateEpaToTiposCultivo(epaId, [tipoId]);
  }

  @Delete(':epaId/tipos-cultivo/:tipoId')
  @RequirePermissions('wiki.editar')
  async disassociateEpaFromTipoCultivoHttp(@Param('epaId', ParseIntPipe) epaId: number, @Param('tipoId', ParseIntPipe) tipoId: number) {
    return this.wikiService.disassociateEpaFromTiposCultivo(epaId, [tipoId]);
  }

  @Get(':epaId/tipos-cultivo')
  @RequirePermissions('wiki.ver')
  async findTiposCultivoByEpaHttp(@Param('epaId', ParseIntPipe) epaId: number) {
    return this.wikiService.findTiposCultivoByEpa(epaId);
  }
}
