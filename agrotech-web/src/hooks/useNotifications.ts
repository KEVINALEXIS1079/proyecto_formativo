
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/api/client';

export type Notification = {
    id: string;
    title: string;
    body?: string;
    unread: boolean;
    time?: string;
    createdAt?: Date;
    source?: 'monitoreo' | 'inventario' | 'usuarios' | 'actividades';
    type?: string;
    metadata?: any;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const mapTypeToSource = (type: string): Notification['source'] => {
        if (type?.includes('ACTIVITY') || type?.includes('ACTIVIDAD')) return 'actividades';
        if (type?.includes('USER') || type?.includes('USUARIO')) return 'usuarios';
        if (type?.includes('INVENTARIO') || type?.includes('STOCK')) return 'inventario';
        return 'monitoreo';
    };

    const mapToFrontend = (n: any): Notification => ({
        id: n.id.toString(),
        title: n.titulo,
        body: n.mensaje,
        unread: !n.leida,
        time: new Date(n.createdAt).toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
        }),
        createdAt: new Date(n.createdAt),
        source: mapTypeToSource(n.tipo),
        type: n.tipo === 'ALERT' ? 'danger' : 'info',
        metadata: n.metadata,
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications');
            // Sort by createdAt desc if not already
            const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(sorted.map(mapToFrontend));
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
            await api.patch(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            await api.patch('/notifications/read-all');
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (n.unread) {
            markAsRead(n.id);
        }

        // Navigation logic based on source/type and metadata
        if (n.source === 'actividades') {
            if (n.metadata?.actividadId) {
                navigate(`/actividades/${n.metadata.actividadId}/editar`); // Or detail page if exists
            } else {
                navigate('/actividades');
            }
        } else if (n.source === 'usuarios') {
            // For user verification, maybe go to users page or roles
            navigate('/usuarios');
        } else if (n.source === 'inventario') {
            navigate('/inventario');
        }
        // Monitoring/IoT redirects?
    };

    return {
        notifications,
        loading,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
        handleNotificationClick
    };
}
