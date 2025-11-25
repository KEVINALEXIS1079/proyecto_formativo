import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, UsePipes, ValidationPipe, Inject, forwardRef, Req } from '@nestjs/common';
import { CultivosGateway } from '../gateways/cultivos.gateway';
import { CultivosService } from '../services/cultivos.service';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('cultivos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CultivosController {
  constructor(
    private readonly cultivosService: CultivosService,
    @Inject(forwardRef(() => CultivosGateway))
    private readonly cultivosGateway: CultivosGateway,
  ) {}

  @Get()
  @RequirePermissions('cultivos.ver')
  async findAll(@Query() query: { loteId?: number; subLoteId?: number; estado?: string; q?: string }) {
    return this._findAll(query.loteId, query.subLoteId, query.estado, query.q);
  }

  @Get(':id')
  @RequirePermissions('cultivos.ver')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this._findOne(id);
  }

  @Post()
  @RequirePermissions('cultivos.crear')
  async create(@Body() createCultivoDto: CreateCultivoDto, @Req() req: any) {
    return this._create(createCultivoDto, req.user?.id);
  }

  @Patch(':id')
  @RequirePermissions('cultivos.editar')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCultivoDto: UpdateCultivoDto) {
    return this._update(id, updateCultivoDto);
  }

  @Delete(':id')
  @RequirePermissions('cultivos.eliminar')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this._remove(id);
  }

  async _findAll(loteId?: number, subLoteId?: number, estado?: string, q?: string) {
    return this.cultivosService.findAllCultivos({ loteId, subLoteId, estado, q });
  }

  async _findOne(id: number) {
    return this.cultivosService.findCultivoById(id);
  }

  async _create(createCultivoDto: CreateCultivoDto, usuarioId?: number) {
    const createdCultivo = await this.cultivosService.createCultivo(createCultivoDto, usuarioId);
    this.cultivosGateway.server.emit('cultivoCreated', createdCultivo);
    return createdCultivo;
  }

  async _update(id: number, updateCultivoDto: UpdateCultivoDto) {
    const updatedCultivo = await this.cultivosService.updateCultivo(id, updateCultivoDto);
    this.cultivosGateway.server.emit('cultivoUpdated', updatedCultivo);
    return updatedCultivo;
  }

  async _remove(id: number) {
    const removedCultivo = await this.cultivosService.removeCultivo(id);
    this.cultivosGateway.server.emit('cultivoDeleted', removedCultivo);
    return removedCultivo;
  }
}
