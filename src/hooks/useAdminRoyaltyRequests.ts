import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRoyaltyRequests,
  updateAdminRoyaltyRequestStatus,
} from "@/services/adminRoyaltyRequests";
import { AdminRoyaltyRequestStatus } from "@/types/admin";

const adminRoyaltyRequestsQueryKey = ["admin", "royalty-requests"] as const;

export const useAdminRoyaltyRequests = () => {
  return useQuery({
    queryKey: adminRoyaltyRequestsQueryKey,
    queryFn: getAdminRoyaltyRequests,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminRoyaltyRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: AdminRoyaltyRequestStatus }) =>
      updateAdminRoyaltyRequestStatus(requestId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminRoyaltyRequestsQueryKey });
    },
  });
};
