
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { Usuario } from '../users/entities/usuario.entity';

@Injectable()
export class NotificationsListener {
    constructor(private readonly notificationsService: NotificationsService) { }

    @OnEvent('activity.notification')
    async handleActivityNotification(payload: any) {
        // payload: { targetUserId, title, body, activityId, type }
        await this.notificationsService.create({
            usuarioId: payload.targetUserId,
            titulo: payload.title,
            mensaje: payload.body,
            tipo: payload.type || 'ACTIVITY_ASSIGNED',
            metadata: { actividadId: payload.activityId },
        });
    }

    @OnEvent('user.verified')
    async handleUserVerified(payload: { user: Usuario; admins: Usuario[] }) {
        const { user, admins } = payload;
        for (const admin of admins) {
            await this.notificationsService.create({
                usuarioId: admin.id,
                titulo: 'Nuevo usuario verificado',
                mensaje: `El usuario ${user.nombre} ${user.apellido} (${user.correo}) se ha verificado y solicita aprobación.`,
                tipo: 'USER_VERIFIED',
                metadata: { relatedUserId: user.id },
            });
        }
    }
    @OnEvent('inventory.stock_alert')
    async handleStockAlert(payload: any) {
        // payload: { insumoId, insumoNombre, estado, stockActual, unidad }
        const titulo = payload.estado === 'AGOTADO' ? 'Insumo Agotado' : 'Stock Bajo';
        const mensaje = payload.estado === 'AGOTADO'
            ? `El insumo ${payload.insumoNombre} se ha agotado.`
            : `El insumo ${payload.insumoNombre} tiene stock bajo (${payload.stockActual} ${payload.unidad}).`;

        // Notify admins (Assuming user ID 1 is admin for now, or fetch admins)
        // Ideally we should fetch all admins. For now let's notify ID 1.
        await this.notificationsService.create({
            usuarioId: 1,
            titulo,
            mensaje,
            tipo: 'INVENTARIO_ALERT',
            metadata: {
                insumoId: payload.insumoId,
                estado: payload.estado
            },
        });
    }
}
