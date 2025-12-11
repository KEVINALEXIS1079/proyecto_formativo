import { Controller, Post, Body, Get, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ReservasService } from '../services/reservas.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('reservas')
@UseGuards(JwtAuthGuard)
export class ReservasController {
    constructor(private readonly reservasService: ReservasService) { }

    @Post()
    create(@Body() createReservaDto: any, @Request() req: any) {
        // Inject user ID from token
        return this.reservasService.crearReserva({
            ...createReservaDto,
            usuarioId: req.user.userId, // Assuming userId is in payload
        });
    }

    @Get()
    findAll() {
        // For now, return all. Can add filters later.
        // We can add a method in service for this.
        // Since I didn't add findAll in Service yet, I will add it now implicitly or call repository directly?
        // Good practice: Service method.
        // I'll add `getReservasActivas` to service soon. For now this might fail if methods don't exist.
        // I'll stick to what I implemented: create, verify, utilize.
        // But I promised "Lista de Reservas".
        // I'll add findAll method to service in the next step or assume it exists/is easy to add.
        // Let's call a method I'll add: findAll
        return this.reservasService.findAll();
    }

    @Patch(':id/liberar')
    liberar(@Param('id') id: string) {
        return this.reservasService.liberarReserva(+id);
    }

    @Patch(':id/utilizar')
    utilizar(@Param('id') id: string) {
        return this.reservasService.utilizarReserva(+id);
    }
}
