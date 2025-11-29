import { api } from '@/shared/api/client';
import type { User, CreateUserDto, UpdateUserDto, UserFilters } from '../models/types/user.types';

export const getUsers = async (filters?: UserFilters): Promise<User[]> => {
  try {
    // Clean up filters - remove empty strings and undefined values
    const cleanFilters = filters ? Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    ) : undefined;
    
    const { data } = await api.get<User[]>('/users', { params: cleanFilters });
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User> => {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
};

export const createUser = async (user: CreateUserDto): Promise<User> => {
  const { data } = await api.post<User>('/users', user);
  return data;
};

export const updateUser = async (id: number, user: UpdateUserDto): Promise<User> => {
  const { data } = await api.patch<User>(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const changeUserRole = async (id: number, rolId: number): Promise<User> => {
  const { data } = await api.patch<User>(`/users/${id}/rol`, { rolId });
  return data;
};

export const uploadAvatar = async (id: number, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<User>(`/users/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
