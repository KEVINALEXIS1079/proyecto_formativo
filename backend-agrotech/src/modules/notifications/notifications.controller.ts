import { Controller, Get, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Request() req: any) {
        // req.user should be populated by JwtStrategy
        return this.notificationsService.findAllForUser(req.user.id);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Patch('read-all')
    async markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
}
