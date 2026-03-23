import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReleases,
  updateAdminReleaseStatus,
  updateAdminReleaseUpc,
  updateAdminTrackIsrc,
} from "@/services/adminReleases";
import { AdminReleaseStatus } from "@/types/admin";

const adminReleasesQueryKey = ["admin", "releases"] as const;

export const useAdminReleases = () => {
  return useQuery({
    queryKey: adminReleasesQueryKey,
    queryFn: getAdminReleases,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminReleaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ releaseId, status }: { releaseId: number; status: AdminReleaseStatus }) =>
      updateAdminReleaseStatus(releaseId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};

export const useUpdateAdminReleaseUpc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ releaseId, upc }: { releaseId: number; upc: string }) =>
      updateAdminReleaseUpc(releaseId, upc),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};

export const useUpdateAdminTrackIsrc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ releaseId, trackId, isrc }: { releaseId: number; trackId: number; isrc: string }) =>
      updateAdminTrackIsrc(releaseId, trackId, isrc),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};