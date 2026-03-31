import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReleases,
  updateAdminReleaseStatus,
  updateAdminReleaseUpc,
  updateAdminTrackIsrc,
  updateAdminTrackTikTokPreview,
} from "@/services/adminReleases";
import { AdminEntityId, AdminReleaseStatus } from "@/types/admin";

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
    mutationFn: ({ releaseId, status }: { releaseId: AdminEntityId; status: AdminReleaseStatus }) =>
      updateAdminReleaseStatus(releaseId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};

export const useUpdateAdminReleaseUpc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ releaseId, upc }: { releaseId: AdminEntityId; upc: string }) =>
      updateAdminReleaseUpc(releaseId, upc),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};

export const useUpdateAdminTrackIsrc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ releaseId, trackId, isrc }: { releaseId: AdminEntityId; trackId: AdminEntityId; isrc: string }) =>
      updateAdminTrackIsrc(releaseId, trackId, isrc),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};
export const useUpdateAdminTrackTikTokPreview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      releaseId,
      trackId,
      minutes,
      seconds,
    }: {
      releaseId: AdminEntityId;
      trackId: AdminEntityId;
      minutes: number;
      seconds: number;
    }) => updateAdminTrackTikTokPreview(releaseId, trackId, minutes, seconds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReleasesQueryKey });
    },
  });
};
