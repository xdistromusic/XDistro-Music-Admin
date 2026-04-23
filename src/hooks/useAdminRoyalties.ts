import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRoyaltyStats,
  getAdminRoyaltyUploadHistory,
  resyncAdminRoyaltyPeriod,
  runAdminRoyaltyImportNormalization,
  runAdminRoyaltyRetentionCleanup,
  uploadAdminRoyaltyFile,
} from "@/services/adminRoyalties";
import { AdminRoyaltyUploadInput } from "@/types/admin";

const adminRoyaltyStatsQueryKey = ["admin", "royalties", "stats"] as const;
const adminRoyaltyUploadHistoryQueryKey = ["admin", "royalties", "uploads"] as const;

export const useAdminRoyaltyStats = () => {
  return useQuery({
    queryKey: adminRoyaltyStatsQueryKey,
    queryFn: getAdminRoyaltyStats,
    refetchOnWindowFocus: false,
  });
};

export const useAdminRoyaltyUploadHistory = () => {
  return useQuery({
    queryKey: adminRoyaltyUploadHistoryQueryKey,
    queryFn: getAdminRoyaltyUploadHistory,
    refetchOnWindowFocus: false,
  });
};

export const useUploadAdminRoyaltyFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminRoyaltyUploadInput) => uploadAdminRoyaltyFile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyStatsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyUploadHistoryQueryKey });
    },
  });
};

export const useRunAdminRoyaltyRetentionCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dryRun: boolean) => runAdminRoyaltyRetentionCleanup(dryRun),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyStatsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyUploadHistoryQueryKey });
    },
  });
};

export const useResyncAdminRoyaltyPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (period: string) => resyncAdminRoyaltyPeriod(period),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyStatsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyUploadHistoryQueryKey });
    },
  });
};

export const useRunAdminRoyaltyImportNormalization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runAdminRoyaltyImportNormalization(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyStatsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyUploadHistoryQueryKey });
    },
  });
};
