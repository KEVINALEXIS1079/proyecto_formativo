import { api } from '@/shared/api/client';
import type { Profile, UpdateProfileInput } from '../models/types/profile.types';

export const getMyProfile = async (): Promise<Profile> => {
  const { data } = await api.get<Profile>('/users/profile/me');
  return data;
};

export const updateMyProfile = async (input: UpdateProfileInput): Promise<Profile> => {
  const { data } = await api.patch<Profile>('/users/profile/me', input);
  return data;
};

export const uploadMyAvatar = async (file: File): Promise<Profile> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post<Profile>('/users/profile/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
