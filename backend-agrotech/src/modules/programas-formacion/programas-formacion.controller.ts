import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ProgramasFormacionService } from './programas-formacion.service';
import { CreateProgramaFormacionDto } from './dtos/create-programa-formacion.dto';
import { UpdateProgramaFormacionDto } from './dtos/update-programa-formacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('programas-formacion')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProgramasFormacionController {
    constructor(private readonly service: ProgramasFormacionService) { }

    @Get()
    @RequirePermissions('programas_formacion.ver')
    findAll(
        @Query('tipo') tipo?: string,
        @Query('estado') estado?: string,
        @Query('q') q?: string,
    ) {
        return this.service.findAll({ tipo, estado, q });
    }

    @Get('tipos')
    @Public()
    getTipos() {
        return this.service.getTiposFormacion();
    }

    @Get(':id')
    @RequirePermissions('programas_formacion.ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    @RequirePermissions('programas_formacion.crear')
    create(@Body() dto: CreateProgramaFormacionDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @RequirePermissions('programas_formacion.editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProgramaFormacionDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('programas_formacion.eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
