
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dtos/create-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
    ) { }

    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationsRepository.create(createNotificationDto);
        return this.notificationsRepository.save(notification);
    }

    async findAllForUser(userId: number): Promise<Notification[]> {
        return this.notificationsRepository.find({
            where: { usuarioId: userId },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: number, userId: number): Promise<Notification> {
        const notification = await this.notificationsRepository.findOne({
            where: { id, usuarioId: userId },
        });
        if (!notification) {
            throw new Error('Notification not found or access denied');
        }
        notification.leida = true;
        return this.notificationsRepository.save(notification);
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationsRepository.update({ usuarioId: userId, leida: false }, { leida: true });
    }
}
