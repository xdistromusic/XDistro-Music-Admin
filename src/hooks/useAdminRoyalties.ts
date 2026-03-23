import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRoyaltyStats,
  getAdminRoyaltyUploadHistory,
  uploadAdminRoyaltyFile,
} from "@/services/adminRoyalties";

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
    mutationFn: ({ fileName }: { fileName: string }) => uploadAdminRoyaltyFile(fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyStatsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyUploadHistoryQueryKey });
    },
  });
};
