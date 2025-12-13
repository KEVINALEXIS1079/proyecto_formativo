import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CreateUserDto, UpdateUserDto,
  CreateLoteDto, CreateSubLoteDto,
  CreateCultivoDto,
  CreateInsumoDto,
  CreateActivityDto,
  CreateRoleDto, UpdateRoleDto,
  CreatePermissionDto, UpdatePermissionDto
} from '../types';

import { Platform } from 'react-native';

// Backend URL (usa tu IP local real)
export const API_URL =
  Platform.OS === 'android'
    ? 'http://192.168.0.102:4000' // Android físico/emulador (IP Local actual)
    : 'http://192.168.0.102:4000'; // Otros (Web, iOS)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------
// 🔐 Interceptor de autorización
// ---------------------------
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');

      console.log("🔑 TOKEN QUE SE ENVÍA:", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // List of public endpoints where token is not expected
        const publicEndpoints = ['/auth/login', '/auth/register', '/auth/recover-password', '/auth/verify-email', '/auth/complete-register', '/auth/resend-verification'];
        const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (!isPublic) {
          console.warn("⚠️ No hay token guardado en AsyncStorage para:", config.url);
        }
      }

      return config;
    } catch (error) {
      console.error("❌ Error leyendo token:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// ---------------------------
// ENDPOINTS
// ---------------------------

export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  completeRegister: (data: { correo: string; code: string }) => api.post('/auth/complete-register', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  resendVerification: (correo: string) => api.post('/auth/resend-verification', { correo }),
  recoverPassword: (email: string) => api.post('/auth/recover-password', { email }),
  getProfile: () => api.get('/auth/profile'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: number) => api.get(`/users/${id}`),
  create: (data: CreateUserDto) => api.post('/users', data),
  update: (id: number, data: UpdateUserDto) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getOne: (id: number) => api.get(`/roles/${id}`),
  create: (data: CreateRoleDto) => api.post('/roles', data),
  update: (id: number, data: UpdateRoleDto) => api.patch(`/roles/${id}`, data),
  delete: (id: number) => api.delete(`/roles/${id}`),
};

export const permissionsAPI = {
  getAll: () => api.get('/permissions'),
  getOne: (id: number) => api.get(`/permissions/${id}`),
  create: (data: CreatePermissionDto) => api.post('/permissions', data),
  update: (id: number, data: UpdatePermissionDto) => api.patch(`/permissions/${id}`, data),
  delete: (id: number) => api.delete(`/permissions/${id}`),
};

export const geoAPI = {
  getLotes: () => api.get('/geo/lotes'),
  createLote: (data: CreateLoteDto) => api.post('/geo/lotes', data),
  updateLote: (id: number, data: any) => api.patch(`/geo/lotes/${id}`, data),
  deleteLote: (id: number) => api.delete(`/geo/lotes/${id}`),

  getSubLotes: () => api.get('/geo/sublotes'),
  createSubLote: (data: CreateSubLoteDto) => api.post('/geo/sublotes', data),
  deleteSubLote: (id: number) => api.delete(`/geo/sublotes/${id}`),
};

export const cropsAPI = {
  getAll: (params?: any) => api.get('/cultivos', { params }),
  create: (data: CreateCultivoDto | FormData) => {
    const isFormData = data instanceof FormData;
    return api.post('/cultivos', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },
  update: (id: number, data: any) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/cultivos/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },
  delete: (id: number) => api.delete(`/cultivos/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (data: CreateInsumoDto) => api.post('/inventory', data),
  update: (id: number, data: any) => api.patch(`/inventory/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/${id}`),

  getCategorias: () => api.get('/inventory/categorias'),
  getAlmacenes: () => api.get('/inventory/almacenes'),
  getProveedores: () => api.get('/inventory/proveedores'),
};

export const activitiesAPI = {
  getAll: (params?: any) => api.get('/activities', { params }),
  getOne: (id: number) => api.get(`/activities/${id}`),
  create: (data: CreateActivityDto) => api.post('/activities', data),
  update: (id: number, data: any) => api.patch(`/activities/${id}`, data),
  delete: (id: number) => api.delete(`/activities/${id}`),
  changeStatus: (id: number, estado: string) => api.patch(`/activities/${id}`, { estado }),

  addResponsable: (actividadId: number, data: any) =>
    api.post(`/activities/${actividadId}/responsables`, data),
  updateResponsable: (actividadId: number, responsableId: number, data: any) =>
    api.patch(`/activities/${actividadId}/responsables/${responsableId}`, data),
  removeResponsable: (actividadId: number, responsableId: number) =>
    api.delete(`/activities/${actividadId}/responsables/${responsableId}`),

  addInsumo: (actividadId: number, data: any) =>
    api.post(`/activities/${actividadId}/insumos`, data),
  updateInsumo: (actividadId: number, insumoId: number, data: any) =>
    api.patch(`/activities/${actividadId}/insumos/${insumoId}`, data),
  removeInsumo: (actividadId: number, insumoId: number) =>
    api.delete(`/activities/${actividadId}/insumos/${insumoId}`),

  addServicio: (actividadId: number, data: any) =>
    api.post(`/activities/${actividadId}/servicios`, data),
  updateServicio: (actividadId: number, servicioId: number, data: any) =>
    api.patch(`/activities/${actividadId}/servicios/${servicioId}`, data),
  removeServicio: (actividadId: number, servicioId: number) =>
    api.delete(`/activities/${actividadId}/servicios/${servicioId}`),

  addEvidencia: (actividadId: number, data: any) =>
    api.post(`/activities/${actividadId}/evidencias`, data),
  removeEvidencia: (actividadId: number, evidenciaId: number) =>
    api.delete(`/activities/${actividadId}/evidencias/${evidenciaId}`),
};

export const epaAPI = {
  list: (params?: any) => api.get('/epas', { params }),
  getById: (id: number) => api.get(`/epas/${id}`),
  create: (data: any) => {
    // If data contains files, use FormData
    if (data.fotosSintomas || data.fotosGenerales) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'fotosSintomas' || key === 'fotosGenerales') {
          if (Array.isArray(data[key])) {
            data[key].forEach((file: any) => {
              formData.append(key, {
                uri: file.uri,
                type: file.type || 'image/jpeg',
                name: file.fileName || file.name || 'image.jpg',
              } as any);
            });
          }
        } else if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, String(data[key]));
        }
      });
      return api.post('/epas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/epas', data);
  },
  update: (id: number, data: any) => api.patch(`/epas/${id}`, data),
  remove: (id: number) => api.delete(`/epas/${id}`),
};

export const tipoEpaAPI = {
  list: () => api.get('/tipo-epa'),
  getById: (id: number) => api.get(`/tipo-epa/${id}`),
  create: (data: any) => api.post('/tipo-epa', data),
};

export const tipoCultivoEpaAPI = {
  list: () => api.get('/tipo-cultivo-epa'),
  create: (data: any) => api.post('/tipo-cultivo-epa', data),
};

export const productionAPI = {
  getVentas: (params?: { clienteId?: number; start?: Date; end?: Date }) =>
    api.get('/production/ventas', { params }),
};

export const reportsAPI = {
  getReporteCompleto: (cultivoId: number, filters?: { fechaDesde?: string; fechaHasta?: string }) => {
    const params = new URLSearchParams();
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    return api.get(`/reports/crops/${cultivoId}/complete?${params.toString()}`);
  },
};

export default api;
