import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, updateMyProfile, uploadMyAvatar } from '../api/profile.api';
import type { Profile, UpdateProfileInput } from '../models/types/profile.types';

const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

export function useProfile() {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const lastUrl = useRef<string | null>(null);

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
    staleTime: 60_000,
  });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (lastUrl.current) {
        URL.revokeObjectURL(lastUrl.current);
      }
    };
  }, []);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: (data) => {
      // Clear preview
      if (lastUrl.current) {
        URL.revokeObjectURL(lastUrl.current);
        lastUrl.current = null;
      }
      setPreviewUrl(null);
      
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  // Handle avatar file selection
  const handleAvatarPick = (file: File) => {
    const url = URL.createObjectURL(file);
    if (lastUrl.current) {
      URL.revokeObjectURL(lastUrl.current);
    }
    lastUrl.current = url;
    setPreviewUrl(url);
    return file;
  };

  // Combined save function (profile + avatar)
  const save = async (input: UpdateProfileInput & { avatar?: File }) => {
    const { avatar, ...profileData } = input;
    
    // Update profile data if there are changes
    if (Object.keys(profileData).length > 0) {
      await updateMutation.mutateAsync(profileData);
    }
    
    // Upload avatar if provided
    if (avatar) {
      await uploadAvatarMutation.mutateAsync(avatar);
    }
  };

  return {
    profile: profile ?? null,
    isLoading,
    isSaving: updateMutation.isPending || uploadAvatarMutation.isPending,
    previewUrl,
    handleAvatarPick,
    save,
    updateProfile: updateMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
  };
}
