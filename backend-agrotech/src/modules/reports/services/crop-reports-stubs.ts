// Stub implementations for missing methods in CropReportsService
// These methods are called by crop-reports.controller.ts but were not implemented

import { Injectable } from '@nestjs/common';

@Injectable()
export class CropReportsServiceStubs {

    async getActivityStats(cultivoId: number) {
        // TODO: Implement activity statistics
        return {
            totalActivities: 0,
            byType: {},
            totalHours: 0,
            totalCost: 0
        };
    }

    async getLaborStats(cultivoId: number) {
        // TODO: Implement labor statistics
        return {
            totalWorkers: 0,
            totalHours: 0,
            totalCost: 0,
            byActivity: []
        };
    }

    async getInputStats(cultivoId: number) {
        // TODO: Implement input statistics
        return {
            totalInputs: 0,
            totalCost: 0,
            byCategory: []
        };
    }

    async getHoursByPeriod(cultivoId: number, granularity: 'day' | 'week' | 'month') {
        // TODO: Implement hours distribution by period
        return {
            labels: [],
            data: []
        };
    }

    async getInsumosByPeriod(cultivoId: number, granularity: 'day' | 'week' | 'month') {
        // TODO: Implement inputs distribution by period
        return {
            labels: [],
            data: []
        };
    }

    async getActivityDetails(cultivoId: number) {
        // TODO: Implement detailed activity list
        return [];
    }

    async getCropHistoryCsv(cultivoId: number, type: 'summary' | 'activities' | 'insumos') {
        // TODO: Implement CSV export
        return 'id,name,value\n';
    }

    async validateConsistency(cultivoId: number) {
        // TODO: Implement data consistency validation
        return {
            isConsistent: true,
            errors: [],
            warnings: []
        };
    }
}
