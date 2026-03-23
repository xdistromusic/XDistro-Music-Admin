import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTakedownRequests,
  updateAdminTakedownRequestStatus,
} from "@/services/adminTakedownRequests";
import { AdminTakedownRequestStatus } from "@/types/admin";

const adminTakedownRequestsQueryKey = ["admin", "takedown-requests"] as const;

export const useAdminTakedownRequests = () => {
  return useQuery({
    queryKey: adminTakedownRequestsQueryKey,
    queryFn: getAdminTakedownRequests,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminTakedownRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: AdminTakedownRequestStatus }) =>
      updateAdminTakedownRequestStatus(requestId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminTakedownRequestsQueryKey });
    },
  });
};
