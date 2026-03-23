import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminArtist,
  getAdminArtists,
  updateAdminArtist,
  updateAdminArtistStatus,
} from "@/services/adminArtists";
import { AdminArtist } from "@/types/admin";

const adminArtistsQueryKey = ["admin", "artists"] as const;

export const useAdminArtists = () => {
  return useQuery({
    queryKey: adminArtistsQueryKey,
    queryFn: getAdminArtists,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteAdminArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artistId: number) => deleteAdminArtist(artistId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminArtistsQueryKey });
    },
  });
};

export const useUpdateAdminArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artist: AdminArtist) => updateAdminArtist(artist),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminArtistsQueryKey });
    },
  });
};

export const useUpdateAdminArtistStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artistId, status }: { artistId: number; status: string }) =>
      updateAdminArtistStatus(artistId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminArtistsQueryKey });
    },
  });
};