import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { WikiService } from '../services/wiki.service';
import { CreateEpaDto } from '../dtos/create-epa.dto';
import { UpdateEpaDto } from '../dtos/update-epa.dto';
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
  async create(createEpaDto: CreateEpaDto) {
    return this.wikiService.create(createEpaDto);
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
  @UsePipes(new ValidationPipe())
  async createEpaHttp(@Body() createEpaDto: CreateEpaDto) {
    return this.create(createEpaDto);
  }

  @Get()
  @RequirePermissions('wiki.ver')
  async findAllEpasHttp() {
    return this.findAll();
  }

  @Get(':id')
  @RequirePermissions('wiki.ver')
  async findOneEpaHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('wiki.editar')
  @UsePipes(new ValidationPipe())
  async updateEpaHttp(@Param('id', ParseIntPipe) id: number, @Body() updateEpaDto: UpdateEpaDto) {
    return this.update(id, updateEpaDto);
  }

  @Delete(':id')
  @RequirePermissions('wiki.eliminar')
  async removeEpaHttp(@Param('id', ParseIntPipe) id: number) {
    return this.remove(id);
  }
}
