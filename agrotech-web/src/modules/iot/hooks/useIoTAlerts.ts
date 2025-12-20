import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IoTApi } from '../api/iot.api';

export interface UseIoTAlertsOptions {
    loteId: number | null;
    sensorId?: string;
    page?: number;
    limit?: number;
    enabled?: boolean;
}

export const useIoTAlerts = ({
    loteId,
    sensorId = 'all',
    page = 1,
    limit = 5,
    enabled = true
}: UseIoTAlertsOptions) => {
    return useQuery({
        queryKey: ['iot-alerts', { loteId, sensorId, page, limit }],
        queryFn: async () => {
            if (!loteId) return { items: [], total: 0 };

            const response: any = await IoTApi.getAlerts({
                loteId,
                sensorId: sensorId !== 'all' ? parseInt(sensorId) : undefined,
                page,
                limit,
            });

            // Normalize response handling (items + total vs array)
            if (response.items) {
                return { items: response.items, total: response.total };
            } else if (Array.isArray(response)) {
                // Fallback legacy
                return { items: response, total: response.length };
            }
            return { items: [], total: 0 };
        },
        enabled: enabled && !!loteId,
        placeholderData: keepPreviousData, // Keep showing previous page while loading next
        staleTime: 1000 * 30, // 30 seconds fresh
        refetchOnWindowFocus: false,
    });
};
