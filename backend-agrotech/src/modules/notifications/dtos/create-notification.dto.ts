
export class CreateNotificationDto {
    titulo: string;
    mensaje: string;
    usuarioId: number;
    tipo?: string;
    metadata?: any;
}
