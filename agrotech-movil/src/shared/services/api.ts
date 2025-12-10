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

// Replace with your actual backend URL
const API_URL = Platform.select({
  android: 'http://10.0.2.2:4000',
  ios: 'http://localhost:4000',
  default: 'http://localhost:4000',
}); 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
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
  getAll: () => api.get('/cultivos'),
  create: (data: CreateCultivoDto) => api.post('/cultivos', data),
  update: (id: number, data: any) => api.patch(`/cultivos/${id}`, data),
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
  // Activities CRUD
  getAll: (params?: any) => api.get('/activities', { params }),
  getOne: (id: number) => api.get(`/activities/${id}`),
  create: (data: CreateActivityDto) => api.post('/activities', data),
  update: (id: number, data: any) => api.patch(`/activities/${id}`, data),
  delete: (id: number) => api.delete(`/activities/${id}`),
  changeStatus: (id: number, estado: string) => api.patch(`/activities/${id}`, { estado }),
  
  // Responsables
  addResponsable: (actividadId: number, data: any) => 
    api.post(`/activities/${actividadId}/responsables`, data),
  updateResponsable: (actividadId: number, responsableId: number, data: any) => 
    api.patch(`/activities/${actividadId}/responsables/${responsableId}`, data),
  removeResponsable: (actividadId: number, responsableId: number) => 
    api.delete(`/activities/${actividadId}/responsables/${responsableId}`),
  
  // Insumos
  addInsumo: (actividadId: number, data: any) => 
    api.post(`/activities/${actividadId}/insumos`, data),
  updateInsumo: (actividadId: number, insumoId: number, data: any) => 
    api.patch(`/activities/${actividadId}/insumos/${insumoId}`, data),
  removeInsumo: (actividadId: number, insumoId: number) => 
    api.delete(`/activities/${actividadId}/insumos/${insumoId}`),
  
  // Servicios
  addServicio: (actividadId: number, data: any) => 
    api.post(`/activities/${actividadId}/servicios`, data),
  updateServicio: (actividadId: number, servicioId: number, data: any) => 
    api.patch(`/activities/${actividadId}/servicios/${servicioId}`, data),
  removeServicio: (actividadId: number, servicioId: number) => 
    api.delete(`/activities/${actividadId}/servicios/${servicioId}`),
  
  // Evidencias
  addEvidencia: (actividadId: number, data: any) => 
    api.post(`/activities/${actividadId}/evidencias`, data),
  removeEvidencia: (actividadId: number, evidenciaId: number) => 
    api.delete(`/activities/${actividadId}/evidencias/${evidenciaId}`),
};

export default api;
