import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { WikiService } from '../services/wiki.service';

@Controller()
export class WikiTypesController {
  constructor(private readonly wikiService: WikiService) {}

  // === TIPO EPA ===

  @Get('tipo-epa')
  async findAllTipoEpa() {
    return this.wikiService.findAllTipoEpa();
  }

  @Post('tipo-epa')
  async createTipoEpa(@Body() data: any) {
    return this.wikiService.createTipoEpa(data);
  }

  @Patch('tipo-epa/:id')
  async updateTipoEpa(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.wikiService.updateTipoEpa(id, data);
  }

  @Delete('tipo-epa/:id')
  async removeTipoEpa(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.removeTipoEpa(id);
  }

  // === TIPO CULTIVO EPA (Wiki) ===

  @Get('tipo-cultivo-epa')
  async findAllTipoCultivo() {
    return this.wikiService.findAllTiposCultivo();
  }

  @Post('tipo-cultivo-epa')
  async createTipoCultivo(@Body() data: any) {
    return this.wikiService.createTipoCultivo(data);
  }

  @Patch('tipo-cultivo-epa/:id')
  async updateTipoCultivo(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.wikiService.updateTipoCultivo(id, data);
  }

  @Delete('tipo-cultivo-epa/:id')
  async removeTipoCultivo(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.removeTipoCultivo(id);
  }
}
